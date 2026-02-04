# frozen_string_literal: true

module MediaResponses
  class OciTranscriptionDecorator
    CONSTANT_IN_JOB_NAME = 'transcriptionjob_media_response'

    def self.job_name(media_response)
      "#{Settings.real_env}_#{CONSTANT_IN_JOB_NAME}_#{media_response.id}_#{Time.now.to_i}"
    end

    def self.media_response_id_from_job_name(job_name)
      match = job_name.match(/^[a-zA-Z0-9]+_#{CONSTANT_IN_JOB_NAME}_(?<id>\d+)_\d+$/o)
      match ? match[:id] : nil
    end

    def self.media_response_id_from_filter(job_name)
      match = job_name.match(/^[a-zA-Z0-9]+_#{CONSTANT_IN_JOB_NAME}_(?<id>\d+)_\d+$/o)
      match ? match[:id] : nil
    end
  end
end
