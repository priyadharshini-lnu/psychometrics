const FIELDS = [
  {
    branch: 'Recipient',
    fields: [
      {
        name: 'Full Name',
        type: 'link',
        value: '{{p://Field/Name}}',
      },
      {
        name: 'Email',
        type: 'link',
        value: '{{p://Field/Email}}',
      },
      {
        name: 'First Name',
        type: 'link',
        value: '{{p://Field/FirstName}}',
      },
      {
        name: 'Last Name',
        type: 'link',
        value: '{{p://Field/LastName}}',
      },
      {
        name: 'DataSheet',
        type: 'dropdown',
        items: ({ datasheetFields }) => datasheetFields.map(f => ({ key: f, value: f })),
        getValue: ({ value }) => `{{p://Field/${value}}`,
      },
    ],
  },
  {
    branch: 'Evaluator',
    fields: [
      {
        name: 'Full Name',
        type: 'link',
        value: '{{p://Field/Name}}',
      },
      {
        name: 'Email',
        type: 'link',
        value: '{{p://Field/Email}}',
      },
      {
        name: 'First Name',
        type: 'link',
        value: '{{p://Field/FirstName}}',
      },
      {
        name: 'Last Name',
        type: 'link',
        value: '{{p://Field/LastName}}',
      },
      {
        name: 'DataSheet',
        type: 'dropdown',
        items: ({ datasheetFields }) => datasheetFields.map(f => ({ key: f, value: f })),
        getValue: ({ value }) => `{{p://Field/${value}}`,
      },
    ],
  },
  {
    branch: 'Subject',
    fields: [
      {
        name: 'Full Name',
        type: 'link',
        value: '{{p://Field/Name}}',
      },
      {
        name: 'Email',
        type: 'link',
        value: '{{p://Field/Email}}',
      },
      {
        name: 'First Name',
        type: 'link',
        value: '{{p://Field/FirstName}}',
      },
      {
        name: 'Last Name',
        type: 'link',
        value: '{{p://Field/LastName}}',
      },
      {
        name: 'DataSheet',
        type: 'dropdown',
        items: ({ datasheetFields }) => datasheetFields.map(f => ({ key: f, value: f })),
        getValue: ({ value }) => `{{p://Field/${value}}}`,
      },
      {
        name: 'Relationship',
        type: 'link',
        value: '{{p://Field/RelationshipName}}',
      },
    ],
  },
  {
    branch: 'Dashboard',
    fields: [
      {
        name: 'Link',
        type: 'link',
        value: '{{dash://ThreeSixty/Link?d=Join the assessment}}',
      },
      {
        name: 'Url',
        type: 'link',
        value: '{{dash://ThreeSixty/URL}}',
      },
    ],
  },
]

export default FIELDS
