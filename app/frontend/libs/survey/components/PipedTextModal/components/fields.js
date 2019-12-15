import moment from 'moment'

const DATE_FORMATS = [
  {
    name: moment().format('M/D/YYYY'),
    format: '%-d/%-m/%Y',
  },
  {
    name: moment().format('YYYY-M-D'),
    format: '%Y-%-m-%-d',
  },
  {
    name: `${moment().format('MM/DD/YYYY')} (leading zero)`,
    format: '%m/%d/%Y',
  },
  {
    name: `${moment().format('DD/MM/YYYY')} (leading zero)`,
    format: '%d/%m/%Y',
  },
  {
    name: `${moment().format('YYYY/MM/DD')} (leading zero)`,
    format: '%Y/%m/%d',
  },
  {
    name: `${moment().format('DD MMM YYYY')}`,
    format: '%d %b %Y',
  },
  {
    name: `${moment().format('dddd, MMMM YYYY')}`,
    format: '%A, %B %Y',
  },
  {
    name: `${moment().format()}`,
    format: '%FT%T%:z',
  },
  {
    name: 'Global Report Date Format',
    format: '%FT%T%:z',
  },
  {
    name: `${moment().format('h:m A')}`,
    format: '%l:%M %p',
    other: false,
  },
  {
    name: `${moment().format('h:ma')}`,
    format: '%l:%M%P',
    other: false,
  },
  {
    name: `${moment().format('H:m')}`,
    format: '%k:%M',
    other: false,
  },
  {
    name: `${moment().format('H:m:s')}`,
    format: '%k:%M:%S',
    other: false,
  },
]

const COMMON_FORMATS = DATE_FORMATS.filter(f => f.other !== false)

const OTHER_DATES_FORMATS = [
  {
    name: 'Next Year',
    prefix: '+1y',
  },
  {
    name: 'Next Month',
    prefix: '+1m',
  },
  {
    name: 'Next Week',
    prefix: '+1w',
  },
  {
    name: 'Day After Tomorrow',
    prefix: '+2d',
  },
  {
    name: 'Tomorrow',
    prefix: '+1d',
  },
  {
    name: 'Yesterday',
    prefix: '-1d',
  },
  {
    name: 'Day Before Yesterday',
    prefix: '-2d',
  },
  {
    name: 'Last Week',
    prefix: '-1w',
  },
  {
    name: 'Last Month',
    prefix: '-1m',
  },
  {
    name: 'Last Year',
    prefix: '-1y',
  },
]

const FIELDS = [
  {
    branch: 'Current Date/Time',
    fields: DATE_FORMATS.map(({ name, format }) => ({ name, type: 'link', value: `{{d://Current?f=${format}}}` })),
  },
  {
    branch: 'Other Date Time',
    fields: OTHER_DATES_FORMATS.map(({ name, prefix }) => ({
      type: 'select',
      name,
      prefix,
      formats: COMMON_FORMATS,
      getValue: ({ format }) => `{{d://Other/${prefix}?f=${format}}}`,
    })),
  },
  {
    branch: 'Evaluator',
    fields: [
      {
        name: 'Full Name',
        type: 'link',
        value: '{{e://Field/Name}}',
      },
      {
        name: 'Email',
        type: 'link',
        value: '{{e://Field/Email}}',
      },
      {
        name: 'First Name',
        type: 'link',
        value: '{{e://Field/FirstName}}',
      },
      {
        name: 'Last Name',
        type: 'link',
        value: '{{e://Field/LastName}}',
      },
      {
        name: 'DataSheet',
        type: 'autocomplete',
        items: ({ datasheetFields }) => datasheetFields.map(field => ({ label: field.name })),
        getValue: ({ label }) => `{{e://Meta/${label}}}`,
      },
    ],
  },
  {
    branch: 'Subject',
    fields: [
      {
        name: 'Full Name',
        type: 'link',
        value: '{{s://Field/Name}}',
      },
      {
        name: 'Email',
        type: 'link',
        value: '{{s://Field/Email}}',
      },
      {
        name: 'First Name',
        type: 'link',
        value: '{{s://Field/FirstName}}',
      },
      {
        name: 'Last Name',
        type: 'link',
        value: '{{s://Field/LastName}}',
      },
      {
        name: 'Relationship',
        type: 'link',
        value: '{{s://Field/RelationshipName}}',
      },
      {
        name: 'DataSheet',
        type: 'autocomplete',
        items: ({ datasheetFields }) => datasheetFields.map(field => ({ label: field.name })),
        getValue: ({ label }) => `{{s://Meta/${label}}}`,
      },
    ],
  },
  {
    branch: 'SubjectSmartText',
    fields: [
      {
        name: 'First Person Possessive',
        type: 'link',
        value: '{{sst://FirstPersonPossessive}}',
      },
      {
        name: 'First Person Reflexive',
        type: 'link',
        value: '{{sst://FirstPersonReflexive}}',
      },
      {
        name: 'Second Person Possessive',
        type: 'link',
        value: '{{sst://SecondPersonPossessive}}',
      },
      {
        name: 'Second Person Reflexive',
        type: 'link',
        value: '{{sst://FirstPersonReflexive}}',
      },
    ],
  },
]

export default FIELDS
