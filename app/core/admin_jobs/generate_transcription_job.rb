# frozen_string_literal: true

module AdminJobs
  class GenerateTranscriptionJob < AdminJobs::Base
    def self.validate(data, _owner)
      raise ArgumentError, 'media_response_id is required' if data[:media_response_id].blank?
    end

    def call
      generate_transcription_for_media_response

      broadcast :waiting
    end

    def generate_title_link
      {
        href: "#{build_campaign_url}/participants/subjects/#{media_response.users_result.subject.id}/assessments",
        label: "transcription_#{media_response.users_result.user_assessment.id}_#{media_response.question_id}"
      }
    end

    def valid?
      media_response.present?
    end

    private

    def media_response
      @media_response ||= MediaResponse.find_by(id: record.data['media_response_id'])
    end

    def generate_transcription_for_media_response
      return unless media_response

      provider = Settings.ai_transcription_provider.provider

      case provider
        when 'oci'
          handle_oci_transcription(media_response)
        when 'faas'
          handle_faas_transcription(media_response)
      end
    end

    def handle_oci_transcription(media_response)
      record.update!(total_tasks: 2)
      ::MediaResponses::Transcriptions::Oci.call!(
        media_response: media_response,
        admin_job_record_id: record.id
      )
    end

    def handle_faas_transcription(media_response)
      record.update!(total_tasks: 1)
      ::MediaResponses::Transcriptions::Faas.call!(
        media_response: media_response,
        admin_job_record_id: record.id
      )
    end
  end
end
