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
        transcribable_record.save_transcription_completed!(data['transcription'])
        update_admin_job_progress
      end

      def update_admin_job_failed
        admin_job&.update!(status: :failed, error_messages: [data['error']])
      end

      def update_admin_job_progress
        return unless data['meta']['admin_job_record_id']

        admin_job&.increment_completed_tasks!
        admin_job&.complete! if admin_job&.total_tasks == admin_job&.completed_tasks
      end
    end
  end
end
