const path = require('path');
const { ClientSecretCredential } = require('@azure/identity');
const core = require('@actions/core');
const { BlobServiceClient } = require('@azure/storage-blob');

exports.getClient = function (credentials, account, container) {
    if (typeof credentials === 'string')
        credentials = JSON.parse(credentials);

    const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        new ClientSecretCredential(credentials.tenantId, credentials.clientId, credentials.clientSecret)
    );

    return {
        async removeBucket(bucket) {
            core.info(`Removing bucket ${bucket} from container ${container}.`);

            const containerClient = blobServiceClient.getContainerClient(container);
            if (!await containerClient.exists()) {
                core.info(`Container ${container} does not exist.`);
                return;
            }

            const files = [];
            for await (const blob of containerClient.listBlobsFlat({ prefix: bucket })) {
                files.push(blob.name);
            }

            if (files.length === 0) {
                core.info(`Bucket ${bucket} does not exist.`);
                return;
            }

            core.info(`Deleting ${files.length} blobs from bucket ${bucket}.`);

            const batchClient = containerClient.getBlobBatchClient();
            await batchClient.deleteBlobs(files.map(file => containerClient.getBlobClient(file)));

            core.info(`Bucket ${bucket} removed.`);

        },

        async upload(bucket, file) {
            core.info(`Uploading file ${file} to bucket ${bucket} in container ${container}.`);

            const containerClient = blobServiceClient.getContainerClient(container);
            if (await containerClient.exists() === false) {
                core.info(`Creating container ${container}.`);
                await containerClient.create();
            }

            await containerClient.getBlockBlobClient(`${bucket}/${path.basename(file)}`).uploadFile(file);
        }
    };
}