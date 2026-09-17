# frozen_string_literal: true

module AI
  module TTS
    # Fetches and caches the Azure neural voice catalogue used to populate admin dropdowns.
    class ListVoices < BaseCommand
      CACHE_KEY = 'ai_tts:azure:voices'
      CACHE_TTL = 7.days
      REQUEST_TIMEOUT = 15

      def call
        broadcast(:ok, cached_voices)
      rescue AI::TTS::Providers::Azure::ConfigurationError => e
        broadcast(:error, e.message)
      rescue Faraday::Error => e
        broadcast(:error, "Azure voices request error: #{e.message}")
      end

      private

      def cached_voices
        Rails.cache.fetch(CACHE_KEY, expires_in: CACHE_TTL) { fetch_voices }
      end

      def fetch_voices
        validate_config!
        response = connection.get('/cognitiveservices/voices/list')
        raise Faraday::Error, "status #{response.status}" unless response.success?

        JSON.parse(response.body).map { |voice| map_voice(voice) }
      end

      def map_voice(voice)
        {
          external_voice_id: voice['ShortName'],
          display_name: voice['DisplayName'],
          locale: voice['Locale'],
          locale_name: voice['LocaleName'],
          gender: voice['Gender'],
          styles: voice['StyleList'] || []
        }
      end

      def connection
        Faraday.new(url: "https://#{config.region}.tts.speech.microsoft.com") do |conn|
          conn.options.timeout = REQUEST_TIMEOUT
          conn.headers['Ocp-Apim-Subscription-Key'] = config.key
        end
      end

      def validate_config!
        raise AI::TTS::Providers::Azure::ConfigurationError, 'Azure Speech key is missing' if config.key.blank?
        raise AI::TTS::Providers::Azure::ConfigurationError, 'Azure Speech region is missing' if config.region.blank?
      end

      def config
        Settings.secrets.azure.speech
      end
    end
  end
end
