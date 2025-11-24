# frozen_string_literal: true

module DailyCo
  class SubscribeToWebhook < Base
    def call
      client.post do |req|
        req.url 'webhooks'
        req.body = build_request_body
      end
    rescue StandardError => e
      Rails.logger.error("Webhook registration error: #{e}")
    end

    private

    def build_request_body
      webhook_url = Rails.application.routes.url_helpers.webhooks_dailyco_recordings_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )

      jwt_secret = JWT.encode({ sub: 'dailyco' }, Settings.secrets.webhook_jwt_secret, 'HS256')

      {
        url: webhook_url,
        eventTypes: ['recording.started',
                     'recording.ready-to-download',
                     'transcript.started',
                     'transcript.ready-to-download'],
        basicAuth: jwt_secret
      }.to_json
    end
  end
end
