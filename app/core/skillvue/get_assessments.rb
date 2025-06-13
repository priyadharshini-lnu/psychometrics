# frozen_string_literal: true

module Skillvue
  class GetAssessments < Base
    def call
      return broadcast :ok, [] unless config

      begin
        response = client.get(api_endpoint)
        parsed_response = ::JSON.parse(response.body)

        if parsed_response['success']
          assessments = parsed_response.dig('data', 'assessments') || []
          broadcast :ok, assessments
        else
          error_message = parsed_response['error'] || 'Unknown error'
          Sentry.capture_message("Skillvue API error: #{error_message}",
                                 extra: { project_id: project.id, response: parsed_response })
          broadcast :ok, []
        end
      rescue Faraday::Error => e
        Sentry.capture_exception(e, extra: { project_id: project.id })
        broadcast :ok, []
      rescue JSON::ParserError => e
        Sentry.capture_exception(e, extra: {
          project_id: project.id,
          response_body: response&.body
        })
        broadcast :ok, []
      end
    end

    def http_method
      'GET'
    end

    def api_endpoint
      "#{Settings.skillvue.base_api_url}/v1/assessments"
    end
  end
end
