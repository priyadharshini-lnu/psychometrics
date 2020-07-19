# frozen_string_literal: true

module Transcribe
  class PreSignUrl < BaseCommand
    LOCALES = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-US'
    }.freeze

    def call
      signer = Aws::Sigv4::Signer.new(
        access_key_id: Rails.application.secrets.access_key_id,
        secret_access_key: Rails.application.secrets.secret_access_key,
        region: Rails.application.secrets.region,
        service: 'transcribe'
      )

      sample_rate = 8000
      url = "wss://transcribestreaming.#{Rails.application.secrets.region}.amazonaws.com:8443/\
stream-transcription-websocket?language-code=#{get_locale}&media-encoding=pcm&sample-rate=#{sample_rate}"

      url = signer.presign_url(
        http_method: 'GET',
        url: url,
        protocol: 'wss',
        expires_in: 300
      )

      broadcast :ok, url
    end

    def get_locale
      if Settings.checking_wizard.audio.supported_locales.include?(I18n.locale.to_s)
        LOCALES[I18n.locale]
      else
        'en-US'
      end
    end
  end
end
