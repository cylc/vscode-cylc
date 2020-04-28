# Owner information

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/cylc/vscode-cylc?logo=github)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/cylc.vscode-cylc?logo=visual-studio-code)

## Deploying

Publishing updates to the Visual Studio Marketplace is done automatically by GitHub Actions when a release is published. The suggested workflow is:
1. Merge the pull request(s) with changes
1. (Locally) run `npm version [major|minor|patch]` as appropriate or manually bump the `package.json` version, and create a PR (1 reviewer is fine)
1. Publish a release on GitHub

If the Deploy workflow fails because you forgot to bump the `package.json` version, the tag associated with the release will be automatically deleted and the release will become a draft. Simply bump the `package.json` version as appropriate and re-publish the release to trigger the workflow again.

### Information on publishing VSCode extensions

Publishing is done by `vsce`. See https://code.visualstudio.com/api/working-with-extensions/publishing-extension. The Azure DevOps personal access token with permissions for publishing to the Visual Studio Marketplace **only** needs to be [stored as a repository secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets), and will need updating on expiry.
