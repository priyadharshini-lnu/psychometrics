# frozen_string_literal: true

module Faas
  module NotificationHandlers
    class MediaToTranscription < Base
      def call
        return broadcast :ok unless transcribable_record

        case data['status']
          when 'failed'
            handle_failed_transcription
          when 'completed'
            handle_completed_transcription
        end

        broadcast :ok
      end

      private

      def transcribable_record
        return unless data['meta']

        @transcribable_record ||= data['meta']['record_type'].constantize.find_by(
          id: data['meta']['record_id']
        )
      end

      def admin_job
        @admin_job ||= AdminJobRecord.find_by(id: data['meta']['admin_job_record_id'])
      end

      def handle_failed_transcription
        error_details = { message: data['error'] }
        transcribable_record.save_transcription_failed!(error_details)
        update_admin_job_failed
      end

      def handle_completed_transcription
        full_text = data['text']
        words = data['words'] || []
        segments = MediaResponses::Transcriptions::SegmentParser.from_azure_words(words, full_text)

        transcribable_record.save_transcription_completed!(
          full_text,
          metadata: data['metadata'] || {},
          segments: segments
        )
        update_admin_job_progress
      end

      def update_admin_job_failed
        return unless admin_job

        formatted_error = "MediaResponse ##{transcribable_record&.id}: #{data['error']}"
        admin_job.with_lock do
          current_errors = admin_job.error_messages || []
          admin_job.update!(
            status: :failed,
            error_messages: current_errors + [formatted_error]
          )
        end
        admin_job.increment_completed_tasks!
      end

      def update_admin_job_progress
        return unless data['meta']['admin_job_record_id']

        admin_job&.increment_completed_tasks!
        admin_job&.complete! if admin_job&.total_tasks == admin_job&.completed_tasks
      end
    end
  end
end
