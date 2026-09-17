const { I18n } = window

export const DEFAULT_PROVIDER = 'azure'

// Azure SSML prosody `rate` presets. `medium` is the neutral default and is omitted from the SSML.
export const RATE_OPTIONS = [
  { value: 'x-slow', label: I18n.t('admin.tts_rate_x_slow') },
  { value: 'slow', label: I18n.t('admin.tts_rate_slow') },
  { value: 'medium', label: I18n.t('admin.tts_rate_medium') },
  { value: 'fast', label: I18n.t('admin.tts_rate_fast') },
  { value: 'x-fast', label: I18n.t('admin.tts_rate_x_fast') },
]

// Azure SSML prosody `pitch` presets. `medium` is the neutral default and is omitted from the SSML.
export const PITCH_OPTIONS = [
  { value: 'x-low', label: I18n.t('admin.tts_pitch_x_low') },
  { value: 'low', label: I18n.t('admin.tts_pitch_low') },
  { value: 'medium', label: I18n.t('admin.tts_pitch_medium') },
  { value: 'high', label: I18n.t('admin.tts_pitch_high') },
  { value: 'x-high', label: I18n.t('admin.tts_pitch_x_high') },
]
