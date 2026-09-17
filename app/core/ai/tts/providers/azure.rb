# frozen_string_literal: true

module AI
  module TTS
    module Providers
      # Synthesizes speech through the Azure Cognitive Services Speech REST API.
      class Azure < BaseCommand
        class SynthesisError < StandardError; end
        class ConfigurationError < StandardError; end

        CONTENT_TYPE = 'application/ssml+xml'
        DEFAULT_OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3'
        REQUEST_TIMEOUT = 30

        private_attr_reader :ssml, :output_format

        def initialize(ssml:, output_format: DEFAULT_OUTPUT_FORMAT)
          @ssml = ssml
          @output_format = output_format
        end

        def call
          validate_config!
          response = connection.post(synthesis_path, ssml)
          raise SynthesisError, "Azure TTS failed (#{response.status}): #{response.body}" unless response.success?

          broadcast(:ok, response.body)
        rescue Faraday::Error => e
          raise SynthesisError, "Azure TTS request error: #{e.message}"
        end

        private

        def connection
          Faraday.new(url: endpoint) do |conn|
            conn.options.timeout = REQUEST_TIMEOUT
            conn.headers['Ocp-Apim-Subscription-Key'] = config.key
            conn.headers['Content-Type'] = CONTENT_TYPE
            conn.headers['X-Microsoft-OutputFormat'] = output_format
          end
        end

        def synthesis_path
          '/cognitiveservices/v1'
        end

        def endpoint
          "https://#{config.region}.tts.speech.microsoft.com"
        end

        def validate_config!
          raise ConfigurationError, 'Azure Speech key is missing' if config.key.blank?
          raise ConfigurationError, 'Azure Speech region is missing' if config.region.blank?
        end

        def config
          Settings.secrets.azure.speech
        end
      end
    end
  end
end
