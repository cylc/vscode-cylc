// This VS Code extension adds clickable links in Cylc workflow files.
//
// It looks for workflow app references, optional config keys, and script
// names, then turns the matching text into links that open the corresponding
// file in the workflow directory.

const path = require('path');
const vscode = require('vscode');

const APP_KEY_PATTERN = /--app-key=([^\s#"'`]+)/g;
const SECTION_HEADER_PATTERN = /^\s*\[\[([^\[\]]+)\]\]\s*$/;
const OPT_CONF_KEY_PATTERN = /(?:-O\s+|--opt-conf-keys=)([^\s#"'`]+)/g;
const ROSE_APP_OPT_CONF_KEYS_PATTERN = /^\s*ROSE_APP_OPT_CONF_KEYS\s*=\s*([^#]+)$/;
const ROSE_APP_OPT_CONF_KEYS_VALUE_PATTERN = /[^\s,]+/g;

// Check whether the target file exists before offering a link to it.
async function targetExists(targetPath) {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(targetPath));
        return true;
    } catch (error) {
        return false;
    }
}

function isFlowCylcDocument(document) {
    return document.uri.fsPath.endsWith('.cylc');
}

// ROSE_APP_OPT_CONF_KEYS can be a space separated list:
// Split a ROSE_APP_OPT_CONF_KEYS value into individual keys like
// "dump first" -> [{ key: "dump" }, { key: "first" }].
function parseRoseAppOptConfKeys(value) {
    const optConfKeys = [];

    ROSE_APP_OPT_CONF_KEYS_VALUE_PATTERN.lastIndex = 0;

    let match;
    while ((match = ROSE_APP_OPT_CONF_KEYS_VALUE_PATTERN.exec(value)) !== null) {
        optConfKeys.push({
            key: match[0],
            index: match.index,
        });
    }

    return optConfKeys;
}

// Scan a Cylc file and collect all clickable links we can infer from it.
// The result is a list of VS Code document links that point at workflow files.
function collectDocumentLinks(document) {
    if (!isFlowCylcDocument(document)) {
        return [];
    }

    // Walk the file line by line and collect every place that should become
    // a link.
    const workflowRoot = path.dirname(document.uri.fsPath);
    const links = [];
    let currentSectionAppKey = null;

    // Riffle through *.cylc file.
    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex += 1) {
        const line = document.lineAt(lineIndex);
        let match;

        // A simple [[section]] header can act as the app key when no explicit
        // --app-key=... has been seen yet.
        const sectionHeaderMatch = SECTION_HEADER_PATTERN.exec(line.text);
        if (sectionHeaderMatch && !currentSectionAppKey) {
            const sectionAppKey = sectionHeaderMatch[1];
            const targetPath = path.join(workflowRoot, 'app', sectionAppKey, 'rose-app.conf');
            const valueIndex = sectionHeaderMatch.index + sectionHeaderMatch[0].indexOf(sectionAppKey);

            links.push(
                (() => {
                    const link = new vscode.DocumentLink(
                    new vscode.Range(
                        lineIndex,
                        valueIndex,
                        lineIndex,
                        valueIndex + sectionAppKey.length,
                    ),
                    vscode.Uri.file(targetPath),
                );
                    link.tooltip = targetPath;
                    return link;
                })(),
            );

            currentSectionAppKey = sectionAppKey;
        }

        // If the line contains an explicit app key, that becomes the active app context.
        APP_KEY_PATTERN.lastIndex = 0;
        while ((match = APP_KEY_PATTERN.exec(line.text)) !== null) {
            const appKey = match[1];
            currentSectionAppKey = appKey;
            const targetPath = path.join(workflowRoot, 'app', appKey, 'rose-app.conf');
            const valueIndex = match.index + match[0].indexOf(appKey);

            links.push(
                (() => {
                    const link = new vscode.DocumentLink(
                    new vscode.Range(
                        lineIndex,
                        valueIndex,
                        lineIndex,
                        valueIndex + appKey.length,
                    ),
                    vscode.Uri.file(targetPath),
                );
                    link.tooltip = targetPath;
                    return link;
                })(),
            );
        }

        // Inside an app context, link references to optional config files.
        if (currentSectionAppKey) {
            OPT_CONF_KEY_PATTERN.lastIndex = 0;
            while ((match = OPT_CONF_KEY_PATTERN.exec(line.text)) !== null) {
                const optConfKey = match[1];
                const targetPath = path.join(
                    workflowRoot,
                    'app',
                    currentSectionAppKey,
                    'opt',
                    `rose-app-${optConfKey}.conf`,
                );
                const valueIndex = match.index + match[0].indexOf(optConfKey);

                links.push(
                    (() => {
                        const link = new vscode.DocumentLink(
                        new vscode.Range(
                            lineIndex,
                            valueIndex,
                            lineIndex,
                            valueIndex + optConfKey.length,
                        ),
                        vscode.Uri.file(targetPath),
                    );
                        link.tooltip = targetPath;
                        return link;
                    })(),
                );
            }

            // Handle the special ROSE_APP_OPT_CONF_KEYS form, which can contain
            // multiple keys separated by spaces.
            const roseAppOptConfKeysMatch = ROSE_APP_OPT_CONF_KEYS_PATTERN.exec(line.text);
            if (roseAppOptConfKeysMatch) {
                const optConfKeysValue = roseAppOptConfKeysMatch[1];
                const valueStartIndex = roseAppOptConfKeysMatch.index + roseAppOptConfKeysMatch[0].indexOf(optConfKeysValue);
                const optConfKeys = parseRoseAppOptConfKeys(optConfKeysValue);

                for (const { key: optConfKey, index: keyIndex } of optConfKeys) {
                    const targetPath = path.join(
                        workflowRoot,
                        'app',
                        currentSectionAppKey,
                        'opt',
                        `rose-app-${optConfKey}.conf`,
                    );
                    const valueIndex = valueStartIndex + keyIndex;

                    links.push(
                        (() => {
                            const link = new vscode.DocumentLink(
                            new vscode.Range(
                                lineIndex,
                                valueIndex,
                                lineIndex,
                                valueIndex + optConfKey.length,
                            ),
                            vscode.Uri.file(targetPath),
                        );
                            link.tooltip = targetPath;
                            return link;
                        })(),
                    );
                }
            }
        }
    }

    return links;
}

function activate(context) {
    const selector = { language: 'cylc', scheme: 'file' };

    // Register the document link provider so VS Code can ask us for links.
    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(selector, {
            async provideDocumentLinks(document) {
                // Only return links whose target files actually exist.
                const links = collectDocumentLinks(document);
                const filteredLinks = [];

                for (const link of links) {
                    if (await targetExists(link.target.fsPath)) {
                        filteredLinks.push(link);
                    }
                }

                return filteredLinks;
            },
        }),
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
