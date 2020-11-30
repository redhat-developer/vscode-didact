# How to provide a new version on VS Code Marketplace

* Check that the version in package.json has not been published yet
  * If already published:
    * Upgrade the version in package.json
    * Run 'npm install' so that the package-lock.json is updated
    * Push changes in a PR
    * Wait for PR to be merged
* Check that someone listed as _submitter_ in Jenkinsfile is available
* Create a tag
* Push the tag to vscode-vscode repository, it will trigger a build after few minutes
* Check build is working fine on [Circle CI](https://app.circleci.com/pipelines/github/redhat-developer/vscode-didact)
* Start build on [Jenkins CI](https://studio-jenkins-csb-codeready.cloud.paas.psi.redhat.com/job/Fuse/job/VSCode/job/vscode-didact-release/) with _publishToMarketPlace_ parameter checked
* Wait the build is waiting on step _Publish to Marketplace_
* Ensure you are logged in
* Go to the console log of the build and click "Proceed"
* Wait few minutes and check that it has been published on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-didact)
* Keep build forever for later reference and edit build information to indicate the version
* Prepare next iteration:
  * Upgrade the version in package.json
  * Run 'npm install' so that the package-lock.json is updated
  * Push changes in a PR
  * Follow PR until it is approved/merged
