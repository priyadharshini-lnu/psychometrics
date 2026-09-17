# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::VoiceCharactersController < BaseController
        skip_before_action :enforce_geo_restriction
        validate_crud_requests Api::V2::AI::VoiceCharacter::Schema

        def preview
          voice_character = ::AI::VoiceCharacter.new(preview_attributes)
          if voice_character.external_voice_id.blank?
            return jsonapi_render_errors [{ detail: I18n.t('admin.tts_voice_required') }],
                                         status: :unprocessable_entity
          end

          result = ::AI::TTS::SynthesizeSpeech.call(voice_character, preview_text(voice_character))

          if result[:ok]
            render json: { attributes: { audio: audio_data_url(result[:ok]) } }, status: :ok
          else
            jsonapi_render_errors [{ detail: result[:error] }], status: :unprocessable_entity
          end
        end

        def voices
          result = ::AI::TTS::ListVoices.call

          if result[:ok]
            render json: { attributes: { voices: result[:ok] } }, status: :ok
          else
            jsonapi_render_errors [{ detail: result[:error] }], status: :unprocessable_entity
          end
        end

        def policy_class
          Api::Administration::AI::VoiceCharacterPolicy
        end

        private

        def preview_attributes
          attributes = params.dig(:data, :attributes) || ActionController::Parameters.new
          attributes.permit(:external_voice_id, :locale, :style, :rate, :pitch)
        end

        def preview_text(voice_character)
          params.dig(:data, :attributes, :text).presence || voice_character.sample_text
        end

        def audio_data_url(payload)
          encoded = Base64.strict_encode64(payload[:content])
          "data:#{payload[:content_type]};base64,#{encoded}"
        end
      end
    end
  end
end
