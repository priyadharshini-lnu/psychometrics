# frozen_string_literal: true

module Microsite
  class GetAssessments < Base
    def call
      return broadcast :ok, [] unless config

      begin
        response = client.get(api_endpoint)

        assessments = response.body.dig('data', 'assessments') || []
        broadcast :ok, assessments
      rescue Faraday::Error => e
        Sentry.capture_exception(e, extra: { project_id: project.id })
        broadcast :ok, []
      rescue StandardError => e
        Sentry.capture_exception(e, extra: {
          project_id: project.id,
          response_body: response&.body
        })
        broadcast :ok, []
      end
    end

    def api_endpoint
      "#{base_url}/api/v1/assessments"
    end
  end
end
