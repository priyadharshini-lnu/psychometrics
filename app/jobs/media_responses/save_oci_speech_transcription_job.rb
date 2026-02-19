# frozen_string_literal: true

module MediaResponses
  class SaveOciSpeechTranscriptionJob < ApplicationJob
    queue_as :default

    def perform(options)
      MediaResponses::Transcriptions::SaveOciSpeechTranscription.call!(options)
    rescue StandardError => e
      admin_job = AdminJobRecord.find_by(id: options[:admin_job_record_id])
      admin_job&.update!(status: :failed, error_messages: [e.message])
      raise
    end
  end
end
