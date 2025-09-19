const { I18n } = window

export const ASSISTANT_FAILURE_FALLBACK_CONTENT = {
  component: 'AssistantMessage',
  message: I18n.t('idp.ai.assistant.failure_fallback.message'),
  suggestions: [I18n.t('idp.ai.assistant.failure_fallback.try_again')],
}
