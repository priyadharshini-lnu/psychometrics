# frozen_string_literal: true

module Skillvue
  class SubscribeToWebhook < Base
    def call
      response = client.post do |req|
        req.url subscription_url
        req.body = request_body.to_json
      end

      if response.status != 200
        raise Skillvue::Exceptions::SubscribeToWebhookFailed,
              "Skillvue::SubscribeToWebhook failed for Project: #{project.id}. Error: #{response.body['error']}"
      end

      save_webhook_urls_to_integration(response)

      broadcast :ok
    rescue Faraday::Error => e
      Sentry.capture_exception(e, extra: { project_id: project.id })
      broadcast :ok
    end

    private

    def save_webhook_urls_to_integration(response)
      result = ::JSON.parse(response.body)

      integration = project.integrations.find_by(name: 'skillvue')
      return unless integration

      data = result['data'] || []

      completion_url = data.find { |sub| sub['event_type'] == 'assessment.completed' }&.dig('url')
      results_url = data.find { |sub| sub['event_type'] == 'report.ready' }&.dig('url')

      config = integration.config.dup
      config['assessment_completion_notification_url'] = completion_url if completion_url
      config['assessment_result_notification_url'] = results_url if results_url

      integration.update_column(:config, config)
    end

    def subscription_url
      "#{Settings.skillvue.base_api_url}/v1/webhooks/subscribe"
    end

    def request_body
      {
        subscriptions: [
          {
            event: 'assessment.completed',
            callback_url: assessment_completion_notification_url
          },
          {
            event: 'report.ready',
            callback_url: assessment_result_notification_url
          }
        ]
      }
    end

    def assessment_completion_notification_url
      Rails.application.routes.url_helpers.webhooks_skillvue_completion_notification_url(
        project_id: project.id,
        host: Settings.domain,
        subdomain: project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end

    def assessment_result_notification_url
      Rails.application.routes.url_helpers.webhooks_skillvue_results_notification_url(
        project_id: project.id,
        host: Settings.domain,
        subdomain: project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end
  end
end
