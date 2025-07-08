# frozen_string_literal: true

module Skillvue
  class GetScoresAndReport < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.post do |req|
        req.url user_report_url
      end

      result = ::JSON.parse(response.body)

      if response.success? && result['success']
        broadcast :ok, result['data']
      else
        handle_failure(result)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def handle_failure(result)
      error_message = result['error'] || 'Unknown error'
      raise Skillvue::Exceptions::GetScoresAndReportFailed,
            "Skillvue::GetScoresAndReport failed for UserAssessment: #{user_assessment.id}. Error: #{error_message}"
    end

    def handle_exception(exception)
      extra_data = {
        user_assessment_id: user_assessment.id,
        project_id: project.id
      }

      if exception.is_a?(JSON::ParserError) && defined?(@response)
        extra_data[:response_body] = @response&.body
      end

      Sentry.capture_exception(exception, extra: extra_data)
      broadcast :ok, []
    end

    def user_report_url
      "#{Settings.skillvue.base_api_url}/v1/assessments/#{product_id}/users/#{external_user_id}/report?format=json"
    end

    def product_id
      assessment.external_assessment_id
    end

    def external_user_id
      @external_user_id ||= user_assessment.skillvue_user_assessment.external_user_id
    end

    def assessment
      @assessment ||= user_assessment.assessment
    end
  end
end
