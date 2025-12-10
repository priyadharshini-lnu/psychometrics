const { I18n } = window

export const ASSISTANT_FAILURE_FALLBACK_CONTENT = {
  component: 'AssistantMessage',
  message: I18n.t('idp.ai.assistant.failure_fallback.message'),
  suggestions: [I18n.t('idp.ai.assistant.failure_fallback.try_again')],
}

export const MAXIMUM_FILE_SIZE_MB = 5
export const CHARACTER_LIMIT = 2000
