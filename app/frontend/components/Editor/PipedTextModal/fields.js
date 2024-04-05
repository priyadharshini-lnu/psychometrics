import { DAILY_DIGEST_EMAILS, CONSOLIDATED_EMAIL_NAMES } from '~/modules/admin/constants/emailTemplate'

const FIELDS = [
  {
    branch: 'User',
    supportedTypes: [
      'welcome_message',
    ],
    fields: [
      {
        name: 'Full Name',
        type: 'link',
        value: '{{u://Field/Name}}',
      },
      {
        name: 'Email',
        type: 'link',
        value: '{{u://Field/Email}}',
      },
      {
        name: 'First Name',
        type: 'link',
        value: '{{u://Field/FirstName}}',
      },
      {
        name: 'Last Name',
        type: 'link',
        value: '{{u://Field/LastName}}',
      },
    ],
  },
  {
    branch: 'Recipient',
    supportedTypes: [
      'subject_invite',
      'subject_reminder',
      'manager_report_ready',
      'approve_report',
      'approve_nomination',
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
        getValue: ({ value }) => `{{p://Meta/${value}}}`,
      },
    ],
  },
  {
    branch: 'Evaluator',
    supportedTypes: [
      'evaluator_invite',
      'evaluator_reminder',
      'evaluator_welcome',
      'nomination_denied',
    ],
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
        type: 'dropdown',
        items: ({ datasheetFields }) => datasheetFields.map(f => ({ key: f, value: f })),
        getValue: ({ value }) => `{{e://Meta/${value}}}`,
      },
    ],
  },
  {
    branch: 'Subject',
    hideOnconsolidation: true,
    supportedTypes: [
      'evaluator_invite',
      'evaluator_reminder',
      'subject_report_ready',
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
        name: 'DataSheet',
        type: 'dropdown',
        items: ({ datasheetFields }) => datasheetFields.map(f => ({ key: f, value: f })),
        getValue: ({ value }) => `{{s://Meta/${value}}}`,
      },
      {
        name: 'Relationship',
        type: 'link',
        value: '{{s://Field/RelationshipName}}',
      },
    ],
  },
  {
    branch: 'Subject Consolidation',
    hideOnUnconsolidation: true,
    supportedTypes: CONSOLIDATED_EMAIL_NAMES,
    fields: [
      {
        name: 'Subject Relationship Table',
        type: 'link',
        value: '{{st://SubjectRelationshipTable}}',
      },
    ],
  },
  {
    branch: 'Nominations',
    supportedTypes: DAILY_DIGEST_EMAILS,
    fields: [
      {
        name: 'Nomination Approval Table',
        type: 'link',
        value: '{{nat://NominationApprovalTable}}',
      },
    ],
  },
  {
    branch: 'Dashboard',
    consolidation: true,
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
        value: '{{dash://Link?d=Join the assessment}}',
      },
      {
        name: 'Url',
        type: 'link',
        value: '{{dash://Url}}',
      },
      {
        name: 'QR Code',
        type: 'link',
        value: '{{dash://QrCode}}',
      },
    ],
  },
  {
    branch: 'Campaigns',
    fields: [
      {
        name: 'Join Link',
        type: 'link',
        value: '{{c://Campaigns/Join}}',
      },
    ],
  },
]

export default FIELDS
