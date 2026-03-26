# frozen_string_literal: true

module MediaResponses
  module Transcriptions
    class Faas < BaseCommand
      private_attr_reader :media_response, :admin_job_record_id

      def initialize(options)
        @media_response = options[:media_response]
        @admin_job_record_id = options[:admin_job_record_id]
      end

      def call
        broadcast :ok, generate_transcription
      end

      private

      def generate_transcription
        return unless media_response.asset.attached?

        media_response.save_transcription_status!(:processing)
        video_url = media_response.asset_url

        ::Faas::MediaToTranscription.call!(
          mediaUrl: video_url,
          audioFormat: 'mp3',
          webhook_message: media_response.id,
          meta: {
            record_id: media_response.id,
            record_type: media_response.class.name,
            admin_job_record_id: admin_job_record_id
          },
          transcriptionParams: {
            **({ language: whisper_language_code } if whisper_language_code)
          }
        )
        Rails.logger.info("Audio extraction triggered for MediaResponse #{media_response.id}")
      end

      def whisper_language_code
        WhisperLocale.resolve(media_response.users_result.user_assessment.selected_locale, fallback: nil)
      end
    end
  end
end
