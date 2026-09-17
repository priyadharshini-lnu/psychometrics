# frozen_string_literal: true

module AI
  module TTS
    # Builds SSML markup understood by Azure (and other SSML-based providers).
    class SSMLBuilder
      MSTTS_NAMESPACE = 'https://www.w3.org/2001/mstts'

      def initialize(voice_character:, text:)
        @voice_character = voice_character
        @text = text.to_s
      end

      def call
        <<~SSML.strip
          <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="#{MSTTS_NAMESPACE}" xml:lang="#{xml_lang}">
            <voice name="#{voice_name}">#{wrapped_content}</voice>
          </speak>
        SSML
      end

      private

      attr_reader :voice_character, :text

      def wrapped_content
        content = escaped_text
        content = wrap_in_prosody(content)
        wrap_in_style(content)
      end

      def wrap_in_prosody(content)
        return content if prosody_attributes.blank?

        %(<prosody #{prosody_attributes}>#{content}</prosody>)
      end

      def wrap_in_style(content)
        return content if voice_character.style.blank?

        %(<mstts:express-as style="#{voice_character.style}">#{content}</mstts:express-as>)
      end

      def prosody_attributes
        attributes = {}
        attributes['rate'] = voice_character.rate if prosody_value?(voice_character.rate)
        attributes['pitch'] = voice_character.pitch if prosody_value?(voice_character.pitch)
        attributes.map { |key, value| %(#{key}="#{value}") }.join(' ')
      end

      # `medium` is the neutral default, so it is omitted to keep the SSML minimal.
      def prosody_value?(value)
        value.present? && value != 'medium'
      end

      def voice_name
        voice_character.external_voice_id
      end

      def xml_lang
        voice_character.locale.presence || 'en-US'
      end

      def escaped_text
        ERB::Util.html_escape(text)
      end
    end
  end
end
