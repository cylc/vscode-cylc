#!/usr/bin/env python3
import json
import sys
from pathlib import Path

SNIPPETS_FILE = 'cylc-snippets.json'


def surrounded_by(str_: str, brackets: str) -> bool:
    """Shorthand for string starting and ending with brackets"""
    return str_.startswith(brackets[0]) and str_.endswith(brackets[1])


def main() -> None:
    try:
        from cylc.flow.cfgspec.workflow import SPEC
    except (NameError, ImportError):
        print(
            "FAIL: This script requires cylc-flow to be installed",
            file=sys.stderr
        )
        sys.exit(1)

    snippets = {}
    for level, item in SPEC.walk():
        if (
            item.name == 'flow.cylc'
            or surrounded_by(item.name, '<>')
            or surrounded_by(item.name, '__')
        ):
            continue
        if item.is_leaf():
            body = item.name + " = "
            body += '${1:' + str(item.default) + '}'
        else:
            body = ('[' * level) + item.name + (']' * level)

        # Snippet name is full path to item, e.g. '[scheduler]UTC mode'.
        # Must have space at start of snippet name because it doesn't work
        # with leading square bracket for some reason.
        snippet_name = ' ' + repr(item).replace('flow.cylc', '')
        snippets[snippet_name] = {
            'prefix': item.name,
            'body': body,
            'description': item.desc
        }

    with open(Path(__file__).parent.parent / SNIPPETS_FILE, 'w') as f:
        f.write(
            json.dumps(snippets, indent=4)
        )


if __name__ == '__main__':
    main()
