function reEnumerateKeys(obj, incr) {
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
            match: '(\\[+)([^\\[\\]]+?)(\\]+)',
            captures: {
                1: {name: 'punctuation.definition.tag.begin.cylc'},
                2: {
                    name: 'entity.name.tag.cylc',
                    patterns: [
                        {include: '#parameterizations'},
                        {include: '#jinja2'}
                    ]
                },
                3: {name: 'punctuation.definition.tag.end.cylc'}
            },
            comment: '@TODO handle `+`, `-`, `/` chars; convert to begin/end instead of match?'
        };
    }
}


class IncludeFile {
    constructor() {
        this.pattern = {
            name: 'meta.include.cylc',
            match: '(%include)[\\t ]*(.*)',
            captures: {
                1: {name: 'keyword.control.include.cylc'},
                2: {
                    name: 'string.cylc',
                    patterns: [
                        {include: '#comments'},
                        {include: '#jinja2'}
                    ]
                }
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


class Setting {
    constructor() {
        this.pattern = {
            name: 'meta.setting.cylc',
            begin: `(\\S[^=#\\n\\r]+?)[\\t ]*(=)[\\t ]*`,
            end: `(?=[#\\n\\r])`, // Will match after subexps in patterns below have finished (i.e. subexps win; end can be dragged onto another line)
            beginCaptures: {
                1: {
                    patterns: [
                        {include: '#jinja2'},
                        {
                            name: 'variable.other.key.cylc',
                            match: `\\b[\\w\\-\\t ]+\\b`,
                        }
                    ]
                },
                2: {name: 'keyword.operator.assignment.cylc'},
            },
            contentName: 'meta.value.cylc',
            patterns: [
                {include: '#strings'},
                new IllegalSecondString().pattern,
                {include: '#jinja2'},
                {
                    match: `([^#\\n\\r]+)`,
                    captures: {
                        1: {
                            name: 'string.unquoted.value.cylc',
                            patterns: [
                                {include: '#jinja2'}
                            ]
                        }
                    }
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
                {include: '#jinja2'},
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
            end: `(["\\n\\r])`,
            beginCaptures: inherit.beginCaptures,
            endCaptures: inherit.endCaptures,
            patterns: inherit.patterns
        };
    }
}

class IllegalSecondString {
    constructor() {
        this.pattern = {
            name: 'invalid.illegal.string.cylc',
            comment: 'In this situation, we cannot have string after string, or string on new line',
            match: `(^|(?<="))[\\t ]*[^#\\n\\r]+`
        };
    }
}


class GraphStringQuoted {
    constructor(type) {
        let str;
        if (type === 'triple') str = new StringQuotedTriple();
        else if (type === 'double') str = new StringQuotedDouble();
        else throw "type must be 'double' or 'triple'";
        this.pattern = {
            name: `meta.graph-syntax.quoted.${type}.cylc`,
            begin: `\\G${str.pattern.begin}`,
            end: str.pattern.end,
            beginCaptures: {
                0: {name: str.pattern.name},
                ...str.pattern.beginCaptures,
            },
            endCaptures: {
                0: {name: str.pattern.name},
                ...str.pattern.endCaptures,
            },
            patterns: [
                {include: '#graphSyntax'}
            ]
        };
    }
}
class GraphStringUnquoted {
    constructor() {
        this.pattern = {
            name: 'meta.graph-syntax.unquoted.cylc',
            match: `\\G[^#\\n\\r"]+`,
            captures: {
                0: {
                    patterns: [
                        {include: '#graphSyntax'}
                    ]
                }
            }
        };
    }
}


class GraphSection7 {
    constructor() {
        this.pattern = {
            comment: 'Cylc 7 graph syntax',
            begin: `\\b(graph)[\\t ]*(=)[\\t ]*`,
            end: `(?=[#\\n\\r])`, // Will match after subexps in patterns below have finished (i.e. subexps win; end can be dragged onto another line)
            beginCaptures: {
                1: {name: 'keyword.graph.cylc'},
                2: {name: 'keyword.operator.assignment.cylc'},
            },
            patterns: [
                {include: '#graphStrings'},
                new IllegalSecondString().pattern,
            ]
        };
    }
}
class GraphSection8 extends GraphSection7 {
    constructor() {
        super();
        const inherit = this.pattern;
        this.pattern = {
            contentName: 'meta.graph-section.cylc',
            comment: 'Cylc 8 graph syntax',
            begin: `\\[{2}[\\t ]*graph[\\t ]*\\]{2}`,
            end: `(?=^[\t ]*\\[)`,
            beginCaptures: {
                0: {
                    patterns: [
                        {include: '#headers'}
                    ]
                }
            },
            patterns: [
                {include: '#comments'},
                {
                    begin: `([\\w\\+\\^\\$][\\w\\+\\-\\^\\$\\/\\t ,:]*)(=)[\\t ]*`, // @TODO: need to implement recurrence syntax properly
                    end: inherit.end,
                    beginCaptures: inherit.beginCaptures,
                    patterns: inherit.patterns
                }
            ]
        };
    }
}


class GraphSyntax {
    constructor() {
        const task = new Task();
        this.patterns = [
            {include: '#comments'},
            {include: '#parameterizations'},
            {include: '#jinja2'},
            new Task().pattern,
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
                begin: '\\(',
                end: '[\\)\\n\\r]',
                beginCaptures: {
                    0: {name: 'punctuation.section.parens.begin.cylc'}
                },
                endCaptures: {
                    0: {name: 'punctuation.section.parens.end.cylc'}
                },
                patterns: [
                    {include: '#graphSyntax'}
                ]
            },
            {
                name: 'meta.variable.suicide.cylc',
                match: `(?<=^|[\\s&>])(!)(${task.regex})`,
                captures: {
                    1: {name: 'keyword.other.suicide.cylc'},
                    2: {name: task.pattern.name},
                }
            },
            {
                name: 'variable.other.xtrigger.cylc',
                match: '(@)[\\w\\-]+',
                captures: {
                    1: {name: 'punctuation.definition.variable.cylc'}
                }
            },
            {
                name: 'constant.character.escape.continuation.cylc',
                match: '\\\\'
            },
            new TaskQualifier().pattern,
            {
                name: 'meta.annotation.inter-cycle.cylc',
                comment: 'e.g. foo[-P1]',
                begin: '(?<=\\S)\\[',
                end: '\\]',
                beginCaptures: {
                    0: {name: 'punctuation.section.brackets.begin.cylc'}
                },
                endCaptures: {
                    0: {name: 'punctuation.section.brackets.end.cylc'}
                },
                patterns: [
                    {include: '#intervals'},
                    {include: '#isodatetimes'},
                    {
                        comment: 'If 1st char is ^ (allowing for spaces)',
                        match: '\\G[\\t ]*(\\^)',
                        captures: {
                            1: {name: 'constant.language.cycle-point.cylc'}
                        }
                    },
                    new ArithmeticOperator().pattern,
                    new IntegerPoint().pattern,
                ]
            },
        ];
    }
}


class Task {
    constructor() {
        this.pattern = {
            name: 'meta.variable.task.cylc',
            match: `${this.regex = `\\b\\w[\\w\\+\\-@%]*`}`
        };
    }
}
class TaskQualifier {
    constructor() {
        this.pattern = {
            comment: 'e.g. foo:fail => bar',
            match: `(?<!^|[\\s:])${this.regex = `((:)([\\w\\-]+))`}`,
            captures: {
                1: {name: 'meta.annotation.qualifier.cylc'},
                2: {name: 'punctuation.definition.annotation.cylc'},
                3: {name: 'variable.annotation.cylc'}
            }
        };
    }
}


class Parameterization {
    constructor() {
        const task = new Task();
        this.pattern = {
            name: 'meta.annotation.parameterization.cylc',
            begin: '<',
            end: '>',
            beginCaptures: {
                0: {name: 'punctuation.definition.annotation.begin.cylc'}
            },
            endCaptures: {
                0: {name: 'punctuation.definition.annotation.end.cylc'}
            },
            patterns: [
                {include: '#jinja2'},
                {
                    name: 'meta.polling.cylc',
                    patterns: [
                        {
                            match: `([^\\s<>]+)(?=::)`,
                            captures: {
                                1: {name: 'entity.name.namespace.suite.cylc'},
                            }
                        },
                        {
                            name: 'punctuation.accessor.cylc',
                            match: `(?<=\\S)::(?=\\S)`
                        },
                        {
                            match: `(?<=::)(${task.regex})`,
                            captures: {
                                1: {name: task.pattern.name},
                            }
                        },
                        new TaskQualifier().pattern,
                    ]
                },
                {
                    match: '(\\w+)[\\t ]*(=)[\\t ]*(\\w+)',
                    captures: {
                        1: {name: 'variable.parameter.cylc'},
                        2: {name: 'keyword.operator.assignment.cylc'},
                        3: {
                            patterns: [
                                {
                                    name: 'constant.numeric.cylc',
                                    match: '\\d+$'
                                },
                                {
                                    name: 'variable.other.cylc',
                                    match: '\\w+'
                                }
                            ]
                        }
                    }
                },
                {
                    match: '([\\+\\-])[\\t ]*(\\d+)(?!\\w)',
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


class IsoTimeZoneLong {
    constructor() {
        this.pattern = {
            match: `${this.regex = '((Z)|(?:([\\+\\-])(\\d{2})(?:(\\:)(\\d{2}))?))'}\\b`,
            captures: {
                1: {name: 'constant.numeric.timezone.long.cylc'},
                2: {name: 'punctuation.definition.timezone.cylc'},
                3: {name: 'punctuation.definition.timezone.cylc'},
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
            match: `${this.regex = '((Z)|(?:([\\+\\-])(\\d{2})(\\d{2})?))'}\\b`,
            captures: {
                1: {name: 'constant.numeric.isotimezone.short.cylc'},
                2: {name: 'punctuation.definition.timezone.cylc'},
                3: {name: 'punctuation.definition.timezone.cylc'},
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
            match: `\\b${this.regex = `(T)(\\d{2})(?:(:)(\\d{2}))?(?:(:)(\\d{2}))?${timeZone.regex}?`}\\b`,
            captures: {
                1: {name: 'punctuation.definition.time.cylc'},
                2: {name: 'constant.numeric.hour.cylc'},
                3: {name: 'punctuation.separator.time.cylc'},
                4: {name: 'constant.numeric.min.cylc'},
                5: {name: 'punctuation.separator.time.cylc'},
                6: {name: 'constant.numeric.sec.cylc'},
                ...reEnumerateKeys(timeZone.pattern.captures, 6),
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
                1: {name: 'punctuation.definition.time.cylc'},
                2: {name: 'constant.numeric.hour.cylc'},
                3: {name: 'constant.numeric.min.cylc'},
                4: {name: 'constant.numeric.sec.cylc'},
                ...reEnumerateKeys(timeZone.pattern.captures, 4),
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
                ...reEnumerateKeys(time.pattern.captures, getLength(date.pattern.captures)),
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
                ...reEnumerateKeys(time.pattern.captures, getLength(date.pattern.captures)),
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
            // {
            //     name: 'invalid.illegal.isodatetime.cylc',
            //     comment: 'Mixed long/short syntaxes e.g. 2000-12-01T00+0530',
            //     match: `\\b${isodate.long.regex}T\\b`
            // },
            {
                name: 'invalid.illegal.isodatetime.cylc',
                comment: 'Mixed long/short syntaxes e.g. 20001201T06:00, 20001201T06+05:30',
                match: `\\b${isodate.short.regex}T\\d{2,}(?:[\\+\\-]\\d+)?\\:\\d*\\b`
            }
        ];
    }
}


class IntervalInteger {
    constructor() {
        this.pattern = {
            name: 'constant.numeric.interval.integer.cylc',
            comment: 'e.g. P1 but not P1D',
            match: '\\b(P)\\d+\\b',
            captures: {
                1: {name: 'punctuation.definition.period.cylc'}
            }
        };
    }
}
class IntervalIsoWeek {
    constructor() {
        this.pattern = {
            name: 'constant.numeric.interval.iso.cylc',
            comment: 'e.g. P1W',
            match: '\\b(P)\\d+(W)\\b',
            captures: {
                1: {name: 'punctuation.definition.period.cylc'},
                2: {name: 'punctuation.definition.week.cylc'}
            }
        };
    }
}
class IntervalIsoTime {
    constructor() {
        this.pattern = {
            name: 'constant.numeric.interval.isotime.cylc',
            comment: `(?:(T)(etc))? matches e.g. T1H1M zero or more times.`,
            match: `${this.regex = `(T)(?:\\d+(H))?(?:\\d+(M))?(?:\\d+(S))?`}`,
            captures: {
                1: {name: 'punctuation.definition.time.cylc'},
                2: {name: 'punctuation.definition.hour.cylc'},
                3: {name: 'punctuation.definition.min.cylc'},
                4: {name: 'punctuation.definition.sec.cylc'},
            }
        };
    }
}
class IntervalIso {
    constructor() {
        const time = new IntervalIsoTime();
        this.pattern = {
            name: 'constant.numeric.interval.iso.cylc',
            comment: `e.g. P1Y1M1DT1H1M1S, P1D, PT1M. (P(?=(?:\\d|T\\d))) captures P only if followed by a digit or T. (?:\\d+(Y))? matches e.g. 1Y zero or more times, etc.`,
            match: `\\b${this.regex = `(P(?=(?:\\d|T\\d)))(?:\\d+(Y))?(?:\\d+(M))?(?:\\d+(D))?(?:${time.regex})?`}\\b`,
            captures: {
                1: {name: 'punctuation.definition.period.cylc'},
                2: {name: 'punctuation.definition.year.cylc'},
                3: {name: 'punctuation.definition.month.cylc'},
                4: {name: 'punctuation.definition.day.cylc'},
                ...reEnumerateKeys(time.pattern.captures, 4),
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


class IntegerPoint {
    constructor() {
        this.pattern = {
            name: 'constant.numeric.integer-point.cylc',
            comment: `Integer as long as it isn't adjacent to a letter`,
            match: '\\b\\d+\\b'
        };
    }
}


class ArithmeticOperator {
    constructor() {
        this.pattern = {
            name: 'keyword.operator.arithmetic.cylc',
            match: '[\\+\\-]'
        };
    }
}







class Jinja2Statement {
    constructor() {
        this.pattern = {
            name: 'meta.embedded.block.jinja',
            comment: `e.g. {% ... %}`,
            begin: `(?={%)`,
            end: `(?<=%})`,
            contentName: 'source.jinja',
            patterns: [
                {include: 'source.jinja'},
                {
                    match: '\\G{%[\\+\\-]?',
                    name: 'punctuation.definition.template-expression.begin.jinja'
                },
                {
                    match: '\\-?%}',
                    name: 'punctuation.definition.template-expression.end.jinja'
                }
            ]
        };
    }
}
class Jinja2Expression {
    constructor() {
        this.pattern = {
            name: 'meta.embedded.block.jinja',
            comment: `e.g. {{ ... }}`,
            begin: `(?={{)`,
            end: `(?<=}})`,
            contentName: 'source.jinja',
            patterns: [
                {include: 'source.jinja'},
                {
                    match: '\\G{{',
                    name: 'punctuation.definition.template-expression.begin.jinja'
                },
                {
                    match: '}}',
                    name: 'punctuation.definition.template-expression.end.jinja'
                }
            ]
        };
    }
}
class Jinja2Comment {
    constructor() {
        this.pattern = {
            name: 'comment.block.jinja',
            comment: `e.g. {# ... #}`,
            begin: `{#`,
            end: `#}`,
            beginCaptures: {
                0: {name: 'punctuation.definition.comment.begin.jinja'}
            },
            endCaptures: {
                0: {name: 'punctuation.definition.comment.end.jinja'}
            },
        };
    }
}



exports.tmLanguage = {
    scopeName: 'source.cylc',
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: 'cylc',
    patterns: [
        {include: '#comments'},
        {include: '#jinja2'},
        {include: '#graphSections'},
        {include: '#headers'},
        {include: '#settings'},
        {include: '#includeFiles'},
        {include: '#keywords'},
        {include: '#strings'},
    ],
    repository: {
        headers: {
            patterns: [
                new Header().pattern,
            ]
        },
        graphSections: {
            patterns: [
                new GraphSection7().pattern,
                new GraphSection8().pattern,
            ]
        },
        graphStrings: {
            patterns: [
                new GraphStringQuoted('triple').pattern,
                new GraphStringQuoted('double').pattern,
                new GraphStringUnquoted().pattern,
            ]
        },
        graphSyntax: {
            patterns: [
                ...new GraphSyntax().patterns,
            ]
        },
        settings: {
            patterns: [
                new Setting().pattern,
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
        jinja2: {
            patterns: [
                new Jinja2Statement().pattern,
                new Jinja2Expression().pattern,
                new Jinja2Comment().pattern,
            ]
        }
    }
}