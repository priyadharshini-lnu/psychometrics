# frozen_string_literal: true

module Microsite
  class ResetAssessment < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      super(user_assessment.project)
    end

    def call
      return broadcast(:ok) unless microsite_user_assessment&.registered? &&
                                   microsite_user_assessment.participant_id.present?

      response = client.post(api_endpoint)

      if response.success?
        broadcast :ok
      else
        handle_failure(response.body)
      end
    rescue Microsite::Exceptions::ResetParticipantFailed
      raise
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def api_endpoint
      "#{base_url}/api/v1/participants/#{microsite_user_assessment.participant_id}/reset"
    end

    def handle_failure(result)
      error_msg = result['message'] || "ResetAssessment failed for UserAssessment: #{user_assessment.id}"
      raise Microsite::Exceptions::ResetParticipantFailed, error_msg
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        project_id: project.id
      })
      raise exception
    end

    def microsite_user_assessment
      @microsite_user_assessment ||= user_assessment.microsite_user_assessment
    end
  end
end
