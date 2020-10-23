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

Publishing (whether via GH Actions or manually) is done by the tool `vsce` using a personal access token (PAT) for the Cylc "Azure DevOps organisation".

#### Updating the PAT

This needs to be done when the existing one expires\*. See https://code.visualstudio.com/api/working-with-extensions/publishing-extension for details on publishing, and how to create a PAT in Azure DevOps. Create a PAT with permissions for publishing to the Visual Studio Marketplace **only**, and [store it as a repository secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

\* The PAT time limit is usually up to one year. To check the expiration date or whether you have a PAT, see https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token

#### Adding/removing an owner

Only PATs of owners of the Cylc "Visual Studio Marketplace publisher" can be used for deploying to the Marketplace. In order to add someone as an owner, they will need go to https://azure.microsoft.com/en-us/services/devops/ and click "Sign in to Azure DevOps" under "Already have an account?" (Met Office staff will already have an account under their official email address). Then go to https://marketplace.visualstudio.com/manage/publishers/cylc and click on "Members", then "Add" and enter their email address.
