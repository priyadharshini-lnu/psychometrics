# frozen_string_literal: true

module Administration
  class MicrositeUserAssessmentSerializer < Panko::Serializer
    attributes :participant_id, :registration_status, :error_message, :raw_response, :assessment_url

    def participant_id
      object&.participant_id
    end

    def registration_status
      object&.registration_status
    end

    def error_message
      object&.error_message
    end

    def raw_response
      object&.answers
    end

    def assessment_url
      object&.url
    end
  end
end
