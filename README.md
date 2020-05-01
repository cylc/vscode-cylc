# vscode-cylc

A Visual Studio Code extension that provides language support for Cylc workflow configuration files.

## Features

Syntax highlighting:
- Cylc 7 :heavy_check_mark:
- Cylc 8 :heavy_check_mark:
- ISO 8601 datetimes :heavy_check_mark:
- Jinja2 :heavy_check_mark: (can be used with a Jinja extension e.g. [Better Jinja](https://marketplace.visualstudio.com/items?itemName=samuelcolvin.jinjahtml))
- Empy :x:

Check [here](https://github.com/cylc/cylc-flow/issues/2752) for info on supported syntax features.

### Screenshot

![Screenshot of syntax highlighting](img/screen1.png)

## Installation

Install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=cylc.vscode-cylc).

## Contributing

This repo includes the [cylc/cylc-textmate-grammar](https://github.com/cylc/cylc-textmate-grammar) repo as a git submodule in the `/syntaxes` directory. If you don't have experience with submodules, you should [read the docs](https://git-scm.com/book/en/v2/Git-Tools-Submodules) first.

The cylc-textmate-grammar repo contains a JSON TextMate grammar file which is used by VSCode for syntax highlighting. Read the [VSCode syntax highlight guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide) for more information. **Note:** do not edit the JSON file when contributing; instead you should edit the JavaScript grammar file and build it, as explained in the [contributing](https://github.com/cylc/cylc-textmate-grammar#contributing) section of cylc-texmate-grammar.

To install a development version of this extension, first find your VSCode extensions folder (should normally be `~/.vscode/extensions/`). Then:
```
cd ~/.vscode/extensions/

git clone --recurse-submodules https://github.com/cylc/vscode-cylc.git
```
The `--recurse-submodules` option automatically initialises the cylc-textmate-grammar repo in the `/syntaxes` directory.

Then you can edit the `/syntaxes/src/cylc.tmLanguage.js` grammar file. First, [read the contributing section](https://github.com/cylc/cylc-textmate-grammar#contributing) of the cylc-textmate-grammar repo - any such edits will be part of that repo as opposed to this vscode-cylc repo. After editing & saving the file, there is a build shortcut task (in `/.vscode/tasks.json`) which can be triggered by <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>. This will run the cylc-textmate-grammar build script which compiles the JSON grammar file.

Contributions to VSCode-specific features, e.g. bracket matching or snippets, are to be made in this repo, not the submodule.



