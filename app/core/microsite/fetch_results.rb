# frozen_string_literal: true

module Microsite
  class FetchResults < Base
    private_attr_reader :microsite_user_assessment

    def initialize(microsite_user_assessment)
      @microsite_user_assessment = microsite_user_assessment
      super(project)
    end

    def call
      response = client.get(api_endpoint)

      if response.success?
        broadcast :ok, extract_results(response.body)
      else
        handle_failure(response)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def api_endpoint
      "#{base_url}/api/v1/participants/#{participant_id}/results"
    end

    def participant_id
      microsite_user_assessment.participant_id
    end

    def project
      microsite_user_assessment.user_assessment.project
    end

    def extract_results(body)
      data = body['data'] || {}
      {
        responses: data['responses'],
        completed_at: data['completedAt']
      }
    end

    def handle_failure(response)
      error_message = response.body&.dig('error') || "HTTP #{response.status}"
      Rails.logger.error("Microsite::FetchResults failed: #{error_message}")
      broadcast :failed, error_message
    end

    def handle_exception(exception)
      Rails.logger.error("Microsite::FetchResults exception: #{exception.message}")
      Sentry.capture_exception(exception, extra: {
        microsite_user_assessment_id: microsite_user_assessment.id,
        participant_id: participant_id
      })
      broadcast :failed, exception.message
    end
  end
end
