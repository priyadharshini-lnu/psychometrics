# frozen_string_literal: true

module Transcribe
  class PreSignUrl < BaseCommand
    LOCALES = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-US',
      ar: 'ar-AE'
    }.freeze

    def call
      aws_config = Settings.secrets.aws[:config]
      signer = Aws::Sigv4::Signer.new(
        access_key_id: aws_config[:access_key_id],
        secret_access_key: aws_config[:secret_access_key],
        region: aws_config[:region],
        service: 'transcribe'
      )

      sample_rate = 8000
      url = "wss://transcribestreaming.#{aws_config[:region]}.amazonaws.com:8443/\
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
