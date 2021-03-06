[![test](https://github.com/synionnl/md-docs-actions/actions/workflows/test.yml/badge.svg)](https://github.com/synionnl/md-docs-actions/actions/workflows/test.yml)
[![audit](https://github.com/synionnl/md-docs-actions/actions/workflows/audit.yml/badge.svg)](https://github.com/synionnl/md-docs-actions/actions/workflows/audit.yml)
[![analyze](https://github.com/synionnl/md-docs-actions/actions/workflows/analyze.yml/badge.svg)](https://github.com/synionnl/md-docs-actions/actions/workflows/analyze.yml)
[![alerts](https://img.shields.io/lgtm/alerts/g/synionnl/md-docs-actions.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/synionnl/md-docs-actions/alerts/)

# md-docs actions

* [Build](./build)
* [Deploy to azure](./azure/deploy)
* [Deploy to GitHub](./github/deploy)
* [Publish test results to Azure](./azure/publish)
* [Download test results from Azure](./azure/download)

## Build and deploy to Github

```
name: md-docs

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
  push:
  repository_dispatch:
    types: [test-execution-changed]

jobs:

  md-docs:

    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:

      - name: Checkout
        uses: actions/checkout@v2

      - name: Download
        uses: synionnl/md-docs-actions/azure/download@v1
        with:
          credentials: ${{ secrets.AZURE_CREDENTIALS }}
          storage_account: synionstorage
          storage_container: test-excecutions
          github_token: ${{ github.token }}
          repository: ${{ github.repository }}

      - name: Build
        uses: synionnl/md-docs-actions/build@v1

      - name: Deploy
        uses: synionnl/md-docs-actions/github/deploy@v1
        with:
          destination_directory: products

```

## Build and deploy to Azure

```
name: md-docs

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:
  push:
  repository_dispatch:
    types: [test-execution-changed]

jobs:

  md-docs:

    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:

      - name: Checkout
        uses: actions/checkout@v2

      - name: Download
        uses: synionnl/md-docs-actions/azure/download@v1
        with:
          credentials: ${{ secrets.AZURE_CREDENTIALS }}
          storage_account: synionstorage
          storage_container: test-excecutions
          github_token: ${{ github.token }}
          repository: ${{ github.repository }}

      - name: Build
        uses: synionnl/md-docs-actions/build@v1

      - name: Deploy
        uses: synionnl/md-docs-actions/azure/deploy@v1
        with:
          credentials: ${{ secrets.AZURE_CREDENTIALS }}
          storage_account: synionstorage
          storage_container: docs-synion-nl
          storage_bucket: products

    - name: Purge CDN
        uses: synionnl/md-docs-actions/azure/purge@v1
        with:
          credentials: ${{ secrets.AZURE_CREDENTIALS }}
          storage_bucket: products        
          cdn_resource_group: synion
          cdn_profile: synion-cdn
          cdn_endpoint: docs-synion-www

```
