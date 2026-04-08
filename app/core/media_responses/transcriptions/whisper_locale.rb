# frozen_string_literal: true

module MediaResponses
  module Transcriptions
    module WhisperLocale
      APP_TO_WHISPER_LOCALE_MAP = {
        'cn' => 'zh',
        'en-GB' => 'en',
        'en-US' => 'en',
        'es-ES' => 'es',
        'pt-BR' => 'pt',
        'zh-TW' => 'zh',
        'zh-HK' => 'zh',
        'zh-Hant' => 'zh',
        'sr-Cyrl' => 'sr',
        'sr-Latn' => 'sr'
      }.freeze

      def self.resolve(locale, fallback: 'auto')
        APP_TO_WHISPER_LOCALE_MAP[locale.to_s] || locale.to_s.presence || fallback
      end
    end
  end
end
