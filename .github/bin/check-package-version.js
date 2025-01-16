/* THIS FILE IS PART OF THE CYLC SUITE ENGINE.
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
---------------------------------------------------------------------
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
    const packageLockVer = JSON.parse(fs.readFileSync('package-lock.json')).version;

    if (releaseVer === packageVer && releaseVer === packageLockVer) {
        console.log(`Version: ${releaseVer}`);
    } else {
        setFailed(`Release version (${releaseVer}) does not match package.json version (${packageVer}) and/or package-lock.json version (${packageLockVer})`);
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
    console.log(`::error::${err}`);
    process.exitCode = 1;
}
