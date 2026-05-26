# frozen_string_literal: true

module Microsite
  class CancelParticipant < Base
    private_attr_reader :participant_id

    def initialize(participant_id:, project_id:)
      @participant_id = participant_id
      super(Client.find(project_id))
    end

    def call
      return broadcast(:ok) if config.blank? || base_url.blank? || api_key.blank?

      response = client.post(api_endpoint)

      if response.success?
        broadcast :ok
      else
        handle_failure(response.body)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    def api_endpoint
      "#{base_url}/api/v1/participants/#{participant_id}/remove"
    end

    private

    def handle_failure(result)
      error_message = result['message'] || 'Remove request failed'
      broadcast :failed, error_message
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        participant_id: participant_id,
        project_id: project.id
      })

      broadcast :failed, exception.message
    end
  end
end
