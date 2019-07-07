const FIELDS = [
  {
    branch: 'Recipient',
    supportedTypes: [
      'subject_invite',
      'subject_reminder',
      'subject_report_ready',
      'manager_report_ready',
      'approve_report',
      'approve_nomination',
      'nomination_denied',
      'request_approval',
      'welcome_message',
      'evaluator_welcome',
      'evaluate_self',
      'invite_evaluators',
      'evaluate_others',
      'custom_message',
    ],
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
    supportedTypes: [
      'evaluator_invite',
      'evaluator_reminder',
      'evaluator_welcome',
    ],
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
    supportedTypes: [
      'evaluator_invite',
      'evaluator_reminder',
      'manager_report_ready',
      'approve_report',
      'approve_nomination',
      'nomination_denied',
      'request_approval',
      'welcome_message',
      'evaluator_welcome',
      'evaluate_self',
    ],
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
    supportedTypes: [
      'subject_invite',
      'evaluator_invite',
      'subject_reminder',
      'evaluator_reminder',
      'subject_report_ready',
      'manager_report_ready',
      'approve_report',
      'approve_nomination',
      'nomination_denied',
      'request_approval',
      'custom_message',
    ],
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
