# frozen_string_literal: true

module Faas
  module NotificationHandlers
    class MediaToTranscription < Base
      def call
        if data['status'] == 'failed'
          Rails.logger.info("Transcription for #{transcribable_record.class.name}: #{transcribable_record.id} failed")
          transcribable_record.update!(transcription_status: :failed)
        end

        if data['status'] == 'completed'
          save_transcription
        end

        broadcast :ok
      end

      private

      def transcribable_record
        @transcribable_record ||= data['meta']['record_type'].constantize.find_by(
          id: data['meta']['record_id']
        )
      end

      def media_response
        @media_response ||= MediaResponse.find_by(id: data['meta']['media_response_id'])
      end

      def save_transcription
        if transcribable_record.transcription.present?
          transcribable_record.transcription.update!(text: data['transcription'])
        else
          transcribable_record.create_transcription!(text: data['transcription'])
        end

        transcribable_record.update!(transcription_status: :completed)
        Rails.logger.info(
          "Successfully saved transcription for #{transcribable_record.class.name}: #{transcribable_record.id}"
        )
      end
    end
  end
end
