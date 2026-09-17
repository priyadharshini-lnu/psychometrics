# frozen_string_literal: true

module AI
  module TTS
    # Synthesizes audio for a piece of text using the voice character's provider.
    class SynthesizeSpeech < BaseCommand
      AUDIO_CONTENT_TYPE = 'audio/mpeg'

      private_attr_reader :voice_character, :text

      def initialize(voice_character, text)
        @voice_character = voice_character
        @text = text
      end

      def call
        return broadcast(:error, I18n.t('admin.tts_blank_text')) if text.blank?

        audio = AI::TTS::Providers::Azure.call!(ssml: ssml) # for now we are using azure only
        broadcast(:ok, content: audio, content_type: AUDIO_CONTENT_TYPE)
      rescue AI::TTS::Providers::Azure::ConfigurationError,
             AI::TTS::Providers::Azure::SynthesisError => e
        Rails.logger.error("AI::TTS::SynthesizeSpeech error: #{e.message}")
        broadcast(:error, e.message)
      end

      private

      def ssml
        AI::TTS::SSMLBuilder.new(voice_character: voice_character, text: text).call
      end
    end
  end
end
