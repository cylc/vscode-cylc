function incrementKeys(obj, incr) {
    // For an Object obj with indexed keys (i.e. the keys are '1', '2', '3' etc), add a number to the keys and return new Object
    const out = {};
    for (let key in obj) {
        let i = parseInt(key);
        out[i + incr] = obj[key];
    }
    return out;
}
function getLength(obj) {
    return Object.keys(obj).length;
}



class Header {
    constructor() {
        this.pattern = {
            name: 'meta.section.cylc',
            match: '(\\[+)([^\\[\\]\\n\\r]+?)(\\]+)',
            captures: {
                1: {name: 'punctuation.definition.tag.begin.cylc'},
                2: {
                    name: 'entity.name.tag.cylc',
                    patterns: [
                        {include: '#parameterizations'}
                    ]
                },
                3: {name: 'punctuation.definition.tag.end.cylc'}
            },
            comment: '@TODO handle `+`, `-`, `/` chars; convert to begin/end instead of match?'
        };
    }
}


class GraphSectionQuotedTriple {
    constructor() {
        this.pattern = {
            contentName: `meta.graph-syntax.quoted.triple.cylc`,
            begin: `${this.regex_graph_equals = '\\b(graph)[\\t ]*(=)[\\t ]*'}("{3})`,
            end: `("{3})`,
            beginCaptures: {
                1: {name: 'keyword.graph.cylc'},
                2: {name: 'keyword.operator.assignment.cylc'},
                3: {name: `string.quoted.triple.begin.cylc`}
            },
            endCaptures: {
                1: {name: `string.quoted.triple.end.cylc`}
            },
            patterns: [
                {include: '#graphSyntax'}
            ]
        };
    }
}
class GraphSectionQuotedDouble extends GraphSectionQuotedTriple {
    constructor() {
        super();
        const inherit = this.pattern;
        this.pattern = {
            contentName: `meta.graph-syntax.quoted.double.cylc`,
            begin: `${this.regex_graph_equals}(")`,
            end: `(["\\n\\r])`,
            beginCaptures: {
                1: inherit.beginCaptures[1],
                2: inherit.beginCaptures[2],
                3: {name: `string.quoted.double.begin.cylc`}
            },
            endCaptures: {
                1: {name: `string.quoted.double.end.cylc`}
            },
            patterns: inherit.patterns
        };
    }
}
class GraphSectionUnquoted extends GraphSectionQuotedTriple {
    constructor() {
        super();
        const inherit = this.pattern;
        this.pattern = {
            contentName: `meta.graph-syntax.unquoted.cylc`,
            begin: `${this.regex_graph_equals}(?!")`,
            end: `[\\n\\r]`,
            beginCaptures: {
                1: inherit.beginCaptures[1],
                2: inherit.beginCaptures[2]
            },
            patterns: inherit.patterns
        }
    }
}


class SettingQuotedTriple {
    constructor() {
        this.pattern = {
            name: 'meta.setting.quoted.triple.cylc',
            begin: `${this.regex_key_equals = '\\b([^=\\n\\r]+?)[\\t ]*(=)[\\t ]*'}(?="{3})`,
            end: '(?<="{3})',
            beginCaptures: {
                1: {name: 'variable.other.key.cylc'},
                2: {name: 'keyword.operator.assignment.cylc'}
            },
            contentName: 'meta.value.cylc',
            patterns: [
                {include: '#strings'}
            ]
        };
    }
}
class SettingQuotedDouble extends SettingQuotedTriple {
    constructor() {
        super();
        const inherit = this.pattern;
        this.pattern = {
            name: 'meta.setting.quoted.double.cylc',
            begin: `${this.regex_key_equals}(?=")`,
            end: '(?<=")',
            beginCaptures: inherit.beginCaptures,
            contentName: inherit.contentName,
            patterns: inherit.patterns
        };
    }
}
class SettingUnquoted extends SettingQuotedTriple {
    constructor() {
        super();
        const inherit = this.pattern;
        this.pattern = {
            name: 'meta.setting.unquoted.cylc',
            match: `${this.regex_key_equals}([^#\\n\\r]*)`,
            captures: {
                1: inherit.beginCaptures[1],
                2: inherit.beginCaptures[2],
                3: {name: 'string.unquoted.value.cylc'}
            }
        };
    }
}


class IncludeFile {
    constructor() {
        this.pattern = {
            name: 'meta.include.cylc',
            match: '(%include)\\s?(.*)',
            captures: {
                1: {name: 'keyword.control.include.cylc'},
                2: {name: 'string.cylc'}
            }
        };
    }
}


class Keyword {
    constructor() {
        this.pattern = {
            name: 'keyword.control.cylc',
            match: '\\b(if|for|while|return)\\b'
        };
    }
}


class LineComment {
    constructor() {
        this.pattern = {
            name: 'comment.line.cylc',
            match: '(#).*',
            captures: {
                1: {name: 'punctuation.definition.comment.cylc'}
            }
        };
    }
}


class Parameterization {
    constructor() {
        this.pattern = {
            name: 'meta.annotation.parameterization.cylc',
            begin: '(<)',
            end: '(>)',
            beginCaptures: {
                1: {name: 'punctuation.definition.annotation.begin.cylc'}
            },
            endCaptures: {
                1: {name: 'punctuation.definition.annotation.end.cylc'}
            },
            patterns: [
                {
                    name: 'meta.polling.cylc',
                    match: '(\\S+)(::)(\\w+)((:)(\\w+))?',
                    captures: {
                        1: {name: 'entity.name.namespace.suite.cylc'},
                        2: {name: 'punctuation.accessor.cylc'},
                        3: {name: 'meta.variable.cylc'},
                        4: {name: 'meta.annotation.qualifier.cylc'},
                        5: {name: 'punctuation.definition.annotation.cylc'},
                        6: {name: 'variable.annotation.cylc'},
                    }
                },
                {
                    match: '(\\w+)[\\t ]*(=)[\\t ]*(\\d*)',
                    captures: {
                        1: {name: 'variable.parameter.cylc'},
                        2: {name: 'keyword.operator.assignment.cylc'},
                        3: {name: 'constant.numeric.cylc'},
                    }
                },
                {
                    match: '(\\w+)[\\t ]*(=)[\\t ]*(\\w*)',
                    captures: {
                        1: {name: 'variable.parameter.cylc'},
                        2: {name: 'keyword.operator.assignment.cylc'},
                        3: {name: 'variable.other.cylc'},
                    }
                },
                {
                    match: '([\\+\\-])[\\t ]*(\\d*)',
                    captures: {
                        '1': {name: 'keyword.operator.arithmetic.cylc'},
                        '2': {name: 'constant.numeric.cylc'}
                    }
                },
                {
                    name: 'variable.parameter.cylc',
                    match: '\\w+'
                },
                {
                    name: 'punctuation.separator.parameter.cylc',
                    match: ','
                }
            ]
        };
    }
}


class StringQuotedTriple {
    constructor() {
        this.pattern = {
            name: `string.quoted.triple.cylc`,
            begin: `("{3})`,
            end: `("{3})`,
            beginCaptures: {
                1: {name: 'punctuation.definition.string.begin.cylc'}
            },
            endCaptures: {
                1: {name: 'punctuation.definition.string.end.cylc'}
            },
            patterns: [
                {
                    name: 'constant.character.escape.cylc',
                    match: '\\\\.'
                }
            ]
        };
    }
}
class StringQuotedDouble extends StringQuotedTriple {
    constructor() {
        super();
        const inherit = this.pattern;
        this.pattern = {
            name: `string.quoted.double.cylc`,
            begin: `(")`,
            end: `([\"\\n\\r])`,
            beginCaptures: inherit.beginCaptures,
            endCaptures: inherit.endCaptures,
            patterns: inherit.patterns
        };
    }
}


class IsoTimeZoneLong {
    constructor() {
        this.pattern = {
            name: 'meta.isotimezone.long.cylc',
            match: `${this.regex = '((Z)|(?:([\\+\\-])(\\d{2})(?:(\\:)(\\d{2}))?))'}\\b`,
            captures: {
                1: {name: 'constant.numeric.timezone.cylc'},
                2: {name: 'keyword.other.unit.utc.cylc'},
                3: {name: 'keyword.other.unit.arithmetic.cylc'},
                4: {name: 'constant.numeric.hour.cylc'},
                5: {name: 'punctuation.separator.time.cylc'},
                6: {name: 'constant.numeric.min.cylc'},
            }
        };
    }
}
class IsoTimeZoneShort {
    constructor() {
        this.pattern = {
            name: 'meta.isotimezone.short.cylc',
            match: `${this.regex = '((Z)|(?:([\\+\\-])(\\d{2})(\\d{2})?))'}\\b`,
            captures: {
                1: {name: 'constant.numeric.timezone.cylc'},
                2: {name: 'keyword.other.unit.utc.cylc'},
                3: {name: 'keyword.other.unit.arithmetic.cylc'},
                4: {name: 'constant.numeric.hour.cylc'},
                5: {name: 'constant.numeric.min.cylc'},
            }
        };
    }
}


class IsoTimeLong {
    constructor() {
        const timeZone = new IsoTimeZoneLong();
        this.pattern = {
            name: 'constant.numeric.isotime.long.cylc',
            match: `\\b${this.regex = `(T)(\\d{2})(?:(\\:)(\\d{2}))?(?:(\\:)(\\d{2}))?${timeZone.regex}?`}\\b`,
            captures: {
                1: {name: 'keyword.other.unit.designator.time.cylc'},
                2: {name: 'constant.numeric.hour.cylc'},
                3: {name: 'punctuation.separator.time.cylc'},
                4: {name: 'constant.numeric.min.cylc'},
                5: {name: 'punctuation.separator.time.cylc'},
                6: {name: 'constant.numeric.sec.cylc'},
                ...incrementKeys(timeZone.pattern.captures, 6),
            }
        };
    }
}
class IsoTimeShort {
    constructor() {
        const timeZone = new IsoTimeZoneShort();
        this.pattern = {
            name: 'constant.numeric.isotime.short.cylc',
            match: `\\b${this.regex = `(T)(\\d{2})(\\d{2})?(\\d{2})?${timeZone.regex}?`}\\b`,
            captures: {
                1: {name: 'keyword.other.unit.designator.time.cylc'},
                2: {name: 'constant.numeric.hour.cylc'},
                3: {name: 'constant.numeric.min.cylc'},
                4: {name: 'constant.numeric.sec.cylc'},
                ...incrementKeys(timeZone.pattern.captures, 4),
            }
        };
    }
}


class IsoDateLong {
    constructor() {
        this.pattern = {
            name: 'constant.numeric.isodate.long.cylc',
            match: `\\b${this.regex = `(\\d{4})(?:(\\-)(\\d{2}))?(?:(\\-)(\\d{2}))?`}\\b`,
            captures: {
                1: {name: 'constant.numeric.year.cylc'},
                2: {name: 'punctuation.separator.date.cylc'},
                3: {name: 'constant.numeric.month.cylc'},
                4: {name: 'punctuation.separator.date.cylc'},
                5: {name: 'constant.numeric.day.cylc'},
            }
        };
    }
}
class IsoDateShort {
    constructor() {
        this.pattern = {
            name: 'constant.numeric.isodate.short.cylc',
            match: `\\b${this.regex = `(\\d{4})(\\d{2})?(\\d{2})?`}\\b`,
            captures: {
                1: {name: 'constant.numeric.year.cylc'},
                2: {name: 'constant.numeric.month.cylc'},
                3: {name: 'constant.numeric.day.cylc'},
            }
        };
    }
}


class IsoDateTimeLong {
    constructor() {
        const time = new IsoTimeLong();
        const date = new IsoDateLong();
        this.pattern = {
            name: 'constant.numeric.isodatetime.long.cylc',
            match: `\\b${this.regex = `${date.regex}(?:${time.regex})?`}\\b`,
            captures: {
                ...date.pattern.captures,
                ...incrementKeys(time.pattern.captures, getLength(date.pattern.captures)),
            }
        };
    }
}
class IsoDateTimeShort {
    constructor() {
        const time = new IsoTimeShort();
        const date = new IsoDateShort();
        this.pattern = {
            name: 'constant.numeric.isodatetime.short.cylc',
            match: `\\b${this.regex = `${date.regex}(?:${time.regex})?`}\\b`,
            captures: {
                ...date.pattern.captures,
                ...incrementKeys(time.pattern.captures, getLength(date.pattern.captures)),
            }
        };
    }
}


class IllegalIsoDateTime {
    constructor() {
        const isodate = {
            long: new IsoDateLong(),
            short: new IsoDateShort()
        };
        const isotime = {
            long: new IsoTimeLong(),
            short: new IsoTimeShort()
        };
        this.patterns = [
            {
                name: 'invalid.illegal.isodatetime.cylc',
                comment: 'Malformed isodatetime e.g. 2000T00',
                match: `\\b\\d{3,7}T\\d{2,}Z?\\b`
            },
            {
                name: 'invalid.illegal.isodatetime.cylc',
                comment: 'Mixed long/short syntaxes e.g. 2000-12-01T0600',
                match: `\\b${isodate.long.regex}T\\d{3,}\\b`
            },
            {
                name: 'invalid.illegal.isodatetime.cylc',
                comment: 'Mixed long/short syntaxes e.g. 2000-12-01T00+0530',
                match: `\\b${isodate.long.regex}T\\d{3,}\\b`
            },
            {
                name: 'invalid.illegal.isodatetime.cylc',
                comment: 'Mixed long/short syntaxes e.g. 20001201T06:00, 20001201T06+05:30',
                match: `\\b${isodate.short.regex}T\\d{2,}(?:[\\+\\-]\\d+)?\:\\d*\\b`
            }
        ];
    }
}


class IntervalInteger {
    constructor() {
        this.pattern = {
            name: 'meta.interval.integer.cylc',
            comment: 'e.g. P1 but not P1D',
            match: '\\b((P)\\d+)\\b',
            captures: {
                1: {name: 'constant.numeric.cylc'},
                2: {name: 'keyword.other.unit.designator.period.cylc'}
            }
        };
    }
}
class IntervalIsoWeek {
    constructor() {
        this.pattern = {
            name: 'meta.interval.iso.cylc',
            comment: 'e.g. P1W',
            match: '\\b((P)\\d+(W))\\b',
            captures: {
                1: {name: 'constant.numeric.cylc'},
                2: {name: 'keyword.other.unit.designator.period.cylc'},
                3: {name: 'keyword.other.unit.designator.week.cylc'}
            }
        };
    }
}
class IntervalIsoTime {
    constructor() {
        this.pattern = {
            name: 'meta.interval.isotime.cylc',
            comment: `(?:(T)(etc))? matches e.g. T1H1M zero or more times.`,
            match: `${this.regex = `(T)(?:\\d+(H))?(?:\\d+(M))?(?:\\d+(S))?`}`,
            captures: {
                1: {name: 'keyword.other.unit.designator.time.cylc'},
                2: {name: 'keyword.other.unit.designator.hour.cylc'},
                3: {name: 'keyword.other.unit.designator.min.cylc'},
                4: {name: 'keyword.other.unit.designator.sec.cylc'},
            }
        };
    }
}
class IntervalIso {
    constructor() {
        const time = new IntervalIsoTime();
        this.pattern = {
            name: 'meta.interval.iso.cylc',
            comment: `e.g. P1Y1M1DT1H1M1S, P1D, PT1M. (P(?=(?:\\d|T\\d))) captures P only if followed by a digit or T. (?:\\d+(Y))? matches e.g. 1Y zero or more times, etc.`,
            match: `\\b${this.regex = `((P(?=(?:\\d|T\\d)))(?:\\d+(Y))?(?:\\d+(M))?(?:\\d+(D))?(?:${time.regex})?)`}\\b`,
            captures: {
                1: {name: 'constant.numeric.cylc'},
                2: {name: 'keyword.other.unit.designator.period.cylc'},
                3: {name: 'keyword.other.unit.designator.year.cylc'},
                4: {name: 'keyword.other.unit.designator.month.cylc'},
                5: {name: 'keyword.other.unit.designator.day.cylc'},
                ...incrementKeys(time.pattern.captures, 5),
            }
        };
    }
}


class IllegalInterval {
    constructor() {
        const isodatetime = {
            long: new IsoDateTimeLong,
            short: new IsoDateTimeShort
        };
        this.patterns = [
            {
                name: 'invalid.illegal.interval.cylc',
                comment: 'e.g. P1H without T separator',
                match: '\\bP\\d+[HS]'
            },
        ];
    }
}



exports.tmLanguage = {
    scopeName: 'source.cylc',
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: 'cylc',
    patterns: [
        {include: '#headers'},
        {include: '#graphSections'},
        {include: '#settings'},
        {include: '#includeFiles'},
        {include: '#keywords'},
        {include: '#strings'},
        {include: '#comments'}
    ],
    repository: {
        headers: {
            patterns: [
                new Header().pattern,
            ]
        },
        graphSections: {
            comment: 'Handle graph sections @TODO Make it parse graph separately',
            patterns: [
                {
                    contentName: 'meta.graph-syntax.cylc',
                    begin: '(R1)\\s*(=)\\s*(""")',
                    end: '(""")',
                    beginCaptures: {
                        '1': {name: 'keyword.graph.cylc'},
                        '2': {name: 'keyword.operator.assignment.cylc'},
                        '3': {name: 'string.quoted.triple.begin.cylc'}
                    },
                    endCaptures: {
                        '1': {name: 'string.quoted.triple.end.cylc'}
                    },
                    patterns: [
                        {include: '#graphSyntax'}
                    ]
                },
                new GraphSectionQuotedTriple().pattern,
                new GraphSectionQuotedDouble().pattern,
                new GraphSectionUnquoted().pattern,
            ]
        },
        settings: {
            patterns: [
                new SettingQuotedTriple().pattern,
                new SettingQuotedDouble().pattern,
                new SettingUnquoted().pattern,
            ]
        },
        includeFiles: {
            patterns: [
                new IncludeFile().pattern,
            ]
        },
        keywords: {
            patterns: [
                new Keyword().pattern,
            ]
        },
        strings: {
            patterns: [
                new StringQuotedTriple().pattern,
                new StringQuotedDouble().pattern,
            ]
        },
        comments: {
           patterns: [
               new LineComment().pattern,
           ]
        },
        parameterizations: {
            patterns: [
                new Parameterization().pattern,
            ]
        },
        isodatetimes: {
            patterns: [
                ...new IllegalIsoDateTime().patterns,
                new IsoDateTimeLong().pattern,
                new IsoDateTimeShort().pattern,
            ]
        },
        intervals: {
            patterns: [
                ...new IllegalInterval().patterns,
                new IntervalInteger().pattern,
                new IntervalIsoWeek().pattern,
                new IntervalIso().pattern,
            ]
        },
        graphSyntax: {
            patterns: [
            {
                include: '#comments'
            },
            {
                include: '#parameterizations'
            },
            {
                name: 'keyword.control.trigger.cylc',
                match: '=>'
            },
            {
                name: 'keyword.other.logical.cylc',
                match: '[\\|&]'
            },
            {
                name: 'meta.parens.cylc',
                begin: '(\\()',
                end: '(\\))',
                beginCaptures: {
                '1': {
                    name: 'punctuation.section.parens.begin.cylc'
                }
                },
                endCaptures: {
                '1': {
                    name: 'punctuation.section.parens.end.cylc'
                }
                },
                patterns: [
                {
                    include: '#graphSyntax'
                }
                ]
            },
            {
                match: '(!)(\\S+)',
                captures: {
                '1': {
                    name: 'keyword.other.suicide.cylc'
                },
                '2': {
                    name: 'meta.variable.suicide.cylc'
                }
                }
            },
            {
                name: 'variable.other.xtrigger.cylc',
                match: '(@)\\S+',
                captures: {
                '1': {
                    name: 'punctuation.definition.variable.cylc'
                }
                }
            },
            {
                name: 'constant.character.escape.continuation.cylc',
                match: '\\\\'
            },
            {
                name: 'meta.annotation.qualifier.cylc',
                comment: 'e.g. foo:fail => bar',
                match: '(?<=\\S)(:)(\\S+)',
                captures: {
                '1': {
                    name: 'punctuation.definition.annotation.cylc'
                },
                '2': {
                    name: 'variable.annotation.cylc'
                }
                }
            },
            {
                name: 'meta.annotation.inter-cycle.cylc',
                comment: 'e.g. foo[-P1]',
                begin: '(?<=\\S)(\\[)',
                end: '(\\])',
                beginCaptures: {
                '1': {
                    name: 'punctuation.section.brackets.begin.cylc'
                }
                },
                endCaptures: {
                '1': {
                    name: 'punctuation.section.brackets.end.cylc'
                }
                },
                patterns: [
                {
                    include: '#intervals'
                },
                {
                    include: '#isodatetimes'
                },
                {
                    comment: 'If 1st char is ^ (allowing for spaces)',
                    match: '\\G[\\t ]*(\\^)',
                    captures: {
                    '1': {
                        name: 'constant.language.initial-point.cylc'
                    }
                    }
                },
                {
                    name: 'keyword.operator.arithmetic.cylc',
                    match: '[\\+\\-]'
                },
                {
                    name: 'constant.numeric.integer-point.cylc',
                    comment: 'Integer as long as it\'s not adjacent to a letter',
                    match: '\\b\\d+\\b'
                }
                ]
            },
            {
                comment: 'Integer intervals',
                name: 'text',
                match: 'meow\\[([-+]{0,1}P\\d+)\\]',
                captures: {
                '1': {
                    name: 'constant.numeric'
                }
                }
            },
            {
                comment: 'Isodatetime intervals - weeks',
                name: 'text',
                match: 'meow\\[(\\^?[-+]?P\\d{1,2}W)\\]',
                captures: {
                '1': {
                    name: 'constant.numeric'
                }
                }
            },
            {
                comment: 'Isodatetime intervals - Simple Format',
                name: 'text',
                match: 'meow\\[([+-]?)(P)(\\d+Y)?(\\d+M)?(\\d+D)?(T?)(\\d+H)?(\\d+M)?(\\d+S)?',
                captures: {
                '1': {
                    name: 'constant.numeric'
                },
                '2': {
                    name: 'constant.numeric'
                },
                '3': {
                    name: 'constant.numeric'
                },
                '4': {
                    name: 'constant.numeric'
                },
                '5': {
                    name: 'constant.numeric'
                },
                '6': {
                    name: 'constant.numeric'
                },
                '7': {
                    name: 'constant.numeric'
                },
                '8': {
                    name: 'constant.numeric'
                },
                '9': {
                    name: 'constant.numeric'
                },
                '10': {
                    name: 'constant.numeric'
                }
                }
            },
            {
                comment: 'Integer points',
                name: 'text',
                match: 'meow\\[([+-]?\\d*)',
                captures: {
                '1': {
                    name: 'constant.numeric'
                }
                }
            },
            {
                comment: 'Isodatetime intervals - complex Format - can this have seconds',
                name: 'text',
                match: 'meow\\[(\\d{4})-?([0-1]\\d)-?([0-3]\\d)?(T)?([0-2]\\d)?:?([0-5]\\d)?\\]',
                captures: {
                '1': {
                    name: 'constant.numeric'
                },
                '2': {
                    name: 'constant.numeric'
                },
                '3': {
                    name: 'constant.numeric'
                },
                '4': {
                    name: 'constant.numeric'
                },
                '5': {
                    name: 'constant.numeric'
                },
                '6': {
                    name: 'constant.numeric'
                },
                '7': {
                    name: 'constant.numeric'
                },
                '8': {
                    name: 'constant.numeric'
                },
                '9': {
                    name: 'constant.numeric'
                },
                '10': {
                    name: 'constant.numeric'
                }
                }
            }
            ]
        }
    }
}