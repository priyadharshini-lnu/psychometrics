# frozen_string_literal: true

module MediaResponses
  class SaveOciSpeechTranscriptionJob < ApplicationJob
    queue_as :default

    def perform(media_response_id, job_id)
      media_response = MediaResponse.find(media_response_id)
      MediaResponses::Transcriptions::SaveOciSpeechTranscription.call!(media_response, job_id)
      Rails.logger.info("Successfully attached transcription for MediaResponse: #{media_response_id}")
    rescue StandardError => e
      Rails.logger.error("Failed to attach transcription for MediaResponse #{media_response_id}: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      raise
    end
  end
end
