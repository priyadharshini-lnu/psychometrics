# frozen_string_literal: true

module MediaResponses
  module Transcriptions
    class Faas < BaseCommand
      private_attr_reader :media_response

      def initialize(media_response)
        @media_response = media_response
      end

      def call
        broadcast :ok, generate_transcription
      end

      private

      def generate_transcription
        media_response.update!(transcription_status: :processing)
        video_url = media_response.asset_url

        ::Faas::MediaToTranscription.call!(
          mediaUrl: video_url,
          audioFormat: 'mp3',
          webhook_message: media_response.id,
          meta: {
            record_id: media_response.id,
            record_type: media_response.class.name
          }
        )
        Rails.logger.info("Audio extraction triggered for MediaResponse #{media_response.id}")
      end
    end
  end
end
