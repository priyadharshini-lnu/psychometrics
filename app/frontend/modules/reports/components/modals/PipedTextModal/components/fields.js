import dayjs from '~/utils/dayjs'

const DATE_FORMATS = [
  {
    name: dayjs().format('M/D/YYYY'),
    format: '%-d/%-m/%Y',
  },
  {
    name: dayjs().format('YYYY-M-D'),
    format: '%Y-%-m-%-d',
  },
  {
    name: `${dayjs().format('MM/DD/YYYY')} (leading zero)`,
    format: '%m/%d/%Y',
  },
  {
    name: `${dayjs().format('DD/MM/YYYY')} (leading zero)`,
    format: '%d/%m/%Y',
  },
  {
    name: `${dayjs().format('YYYY/MM/DD')} (leading zero)`,
    format: '%Y/%m/%d',
  },
  {
    name: `${dayjs().format('DD MMM YYYY')}`,
    format: '%d %b %Y',
  },
  {
    name: `${dayjs().format('dddd, MMMM YYYY')}`,
    format: '%A, %B %Y',
  },
  {
    name: `${dayjs().format()}`,
    format: '%FT%T%:z',
  },
  {
    name: 'Global Report Date Format',
    format: '%FT%T%:z',
  },
  {
    name: `${dayjs().format('h:m A')}`,
    format: '%l:%M %p',
    other: false,
  },
  {
    name: `${dayjs().format('h:ma')}`,
    format: '%l:%M%P',
    other: false,
  },
  {
    name: `${dayjs().format('H:m')}`,
    format: '%k:%M',
    other: false,
  },
  {
    name: `${dayjs().format('H:m:s')}`,
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
  {
    name: 'Assessment Completed Date',
    path: 'Report/AssessmentCompletedAt',
  },
  {
    name: 'Self Evaluation Date',
    path: 'Report/SelfEvaluation',
  },
  {
    name: 'Last Evaluation Date',
    path: 'Report/LastEvaluation',
  },
  {
    name: 'Assessment Center Attended Date',
    path: 'AssessmentCenter/AttendedDate',
  },
]

const getFactorFieldValue = (field, selectedFactorId) => {
  if (!selectedFactorId) return 'missing_factor_id'
  return `{{fr://Field/${field}?factor_id=${selectedFactorId}}}`
}

const FIELDS = [
  {
    branch: 'Current Date/Time',
    fields: DATE_FORMATS.map(({ name, format }) => ({ name, type: 'link', value: `{{d://Current?f=${format}}}` })),
  },
  {
    branch: 'Other Date Time',
    fields: OTHER_DATES_FORMATS.map(({ name, prefix, path }) => {
      path = path || `Other/${prefix}`
      return {
        type: 'select',
        name,
        prefix,
        formats: COMMON_FORMATS,
        getValue: ({ format }) => `{{d://${path}?f=${format}}}`,
      }
    }),
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
        name: 'Current Job Role',
        type: 'link',
        value: '{{cu://Field/CurrentJobRole}}',
      },
      {
        name: 'Target Job Role',
        type: 'link',
        value: '{{cu://Field/TargetJobRole}}',
      },
      {
        name: 'ProfileCustomField',
        type: 'profile_custom_field',
        getValue: fieldName => `{{s://ProfileCustomField/${fieldName}}}`,
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
    branch: 'Assessment',
    fields: [
      {
        name: 'Time taken',
        type: 'link',
        value: '{{assessment://Field/timeTaken}}',
      },
      {
        name: 'Max time allowed',
        type: 'link',
        value: '{{assessment://Field/totalTimeAllowed}}',
      },
    ],
  },
  {
    branch: 'Factor Scores',
    fields: [
      {
        name: 'Factor',
        type: 'autocomplete',
        items: ({ factors }) => factors.map(factor => ({ label: factor.name, value: factor.id })),
        getValue: ({ value }) => ({ selectedFactorId: value }),
        preventInsert: true,
      },
      {
        name: 'Total questions',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('totalQuestions', selectedFactorId),
      },
      {
        name: 'Percentage',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('percentage', selectedFactorId),
      },
      {
        name: 'Questions attempted',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('questionsAttempted', selectedFactorId),
      },
      {
        name: 'Questions not attempted',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('questionsNotAttempted', selectedFactorId),
      },
      {
        name: 'Questions partially correct',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('questionsPartialCorrect', selectedFactorId),
      },
      {
        name: 'Questions correct',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('questionsCorrect', selectedFactorId),
      },
      {
        name: 'Questions incorrect',
        type: 'link',
        getValue: ({ selectedFactorId }) => getFactorFieldValue('questionsIncorrect', selectedFactorId),
      },
    ],
  },
]

export default FIELDS
