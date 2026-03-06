export const ASSISTANT_TYPES = {
  content_writer: {
    id: 'content_writer',
    name: 'Content Writer',
    supportedDependencies: ['datasheet', 'assessments', 'campaign_factors'],
  },
  idp_assistant: {
    id: 'idp_assistant',
    name: 'IDP Assistant',
    supportedDependencies: ['assessments'],
  },
  assistant_tool: {
    id: 'assistant_tool',
    name: 'Assistant Tool',
    supportedDependencies: [],
  },
  development_actions_assistant: {
    id: 'development_actions_assistant',
    name: 'Development Actions Assistant',
    supportedDependencies: [],
  },
  writing_assistant: {
    id: 'writing_assistant',
    name: 'Writing Assistant',
    supportedDependencies: [],
  },
  translation_assistant: {
    id: 'translation_assistant',
    name: 'Translation Assistant',
    supportedDependencies: [],
  },
  content_analysis_assistant: {
    id: 'content_analysis_assistant',
    name: 'Content Analysis Assistant',
  },
}

export const DEPENDENCY_TYPES = {
  datasheet: {
    id: 'datasheet',
    name: 'Datasheet',
  },
  assessments: {
    id: 'assessments',
    name: 'Assessments',
  },
  campaign_factors: {
    id: 'campaign_factors',
    name: 'Campaign Factors',
  },
}

export const SCHEMA_KEY_TYPES = {
  string: {
    value: 'string',
    label: 'String',
  },
  html: {
    value: 'html',
    label: 'HTML',
  },
  markdown: {
    value: 'markdown',
    label: 'Markdown',
  },
}
