/*
Description:
    Checks the package.json version matches the supplied git tag ref
    Exits with code 0 if it matches, otherwise 1
Usage (from root directory):
    $ node .github/bin/check-package-version.js <ref>
Args:
    <ref> (String): The ref to check the package version against
        E.g. 'refs/tags/v1.2.3'
*/

const fs = require('fs');

try {
    const releaseVer = getReleaseVersion();
    const packageVer = JSON.parse(fs.readFileSync('package.json')).version;
    if (releaseVer === packageVer) {
        console.log(`Version: ${releaseVer}`);
    } else {
        setFailed(`Release version (${releaseVer}) does not match package.json version (${packageVer})`);
    }

} catch (error) {
    setFailed(error);
}

function getReleaseVersion() {
    const ref = process.argv[2];
    if (ref) {
        const matches = ref.match(/refs\/tags\/v(.+)/);
        if (matches) {
            return matches[1];
        } else {
            throw new Error(`No tag detected in ref '${ref}'`);
        }
    } else {
        throw new Error('No ref argument supplied');
    }
}

function setFailed(err) {
    err = err instanceof Error ? err.toString() : err;
    console.log(err);
    process.exitCode = 1;
}
