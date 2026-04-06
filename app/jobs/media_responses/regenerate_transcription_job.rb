# frozen_string_literal: true

module MediaResponses
  class RegenerateTranscriptionJob < ApplicationJob
    queue_as :default

    STALE_PROCESSING_THRESHOLD = 1.hour

    retry_on OCI::Errors::ServiceError, wait: :polynomially_longer, attempts: 5

    def perform(media_response_id, admin_job_record_id = nil)
      media_response = MediaResponse.find_by(id: media_response_id)
      return skip_and_update_progress(admin_job_record_id) unless media_response&.asset&.attached?

      transcription = media_response.transcription

      return skip_and_update_progress(admin_job_record_id) if transcription&.completed?

      if transcription&.processing? && !stale_processing?(transcription)
        return skip_and_update_progress(admin_job_record_id)
      end

      case Settings.ai_transcription_provider.provider
        when 'oci'
          MediaResponses::Transcriptions::Oci.call!(
            media_response: media_response,
            admin_job_record_id: admin_job_record_id
          )
        when 'faas'
          MediaResponses::Transcriptions::Faas.call!(
            media_response: media_response,
            admin_job_record_id: admin_job_record_id
          )
      end
    end

    private

    def stale_processing?(transcription)
      transcription.updated_at < STALE_PROCESSING_THRESHOLD.ago
    end

    def skip_and_update_progress(admin_job_record_id)
      return unless admin_job_record_id

      admin_job_record = AdminJobRecord.find_by(id: admin_job_record_id)
      admin_job_record&.increment_completed_tasks!
    end
  end
end
