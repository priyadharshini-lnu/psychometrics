export const ASSISTANT_TYPES = {
  content_writer: {
    id: 'content_writer',
    name: 'Content Writer',
    supportedDependencies: ['datasheet', 'assessments', 'campaign_factors'],
    advancedPromptingEnabled: true,
    defaultModelParams: { maxTokens: 4000 },
  },
  idp_assistant: {
    id: 'idp_assistant',
    name: 'IDP Assistant',
    supportedDependencies: ['assessments'],
    advancedPromptingEnabled: true,
    defaultModelParams: { maxTokens: 4000, temperature: 0.2 },
  },
  assistant_tool: {
    id: 'assistant_tool',
    name: 'Assistant Tool',
    supportedDependencies: [],
    advancedPromptingEnabled: false,
    defaultModelParams: { maxTokens: 2000 },
  },
  development_actions_assistant: {
    id: 'development_actions_assistant',
    name: 'Development Actions Assistant',
    supportedDependencies: [],
    advancedPromptingEnabled: false,
    defaultModelParams: { maxTokens: 1500 },
  },
  writing_assistant: {
    id: 'writing_assistant',
    name: 'Writing Assistant',
    supportedDependencies: [],
    advancedPromptingEnabled: false,
    defaultModelParams: { maxTokens: 800, temperature: 0.5 },
  },
  translation_assistant: {
    id: 'translation_assistant',
    name: 'Translation Assistant',
    supportedDependencies: [],
    advancedPromptingEnabled: false,
    defaultModelParams: { maxTokens: 2500, temperature: 0.5 },
  },
  content_analysis_assistant: {
    id: 'content_analysis_assistant',
    name: 'Content Analysis Assistant',
    advancedPromptingEnabled: false,
    defaultModelParams: { maxTokens: 4000, temperature: 0.1 },
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
