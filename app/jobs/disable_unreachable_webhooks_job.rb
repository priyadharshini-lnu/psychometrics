# frozen_string_literal: true

class DisableUnreachableWebhooksJob < ApplicationJob
  REQUEST_TIMEOUT_SECONDS = 5
  OPEN_TIMEOUT_SECONDS = 3

  def perform
    return if ENV.fetch('REAL_ENV', 'local').starts_with?('production')

    Webhook.active.find_each do |webhook|
      if webhook_url_unreachable?(webhook.url)
        webhook.update(active: false)
      end
    end
  end

  private

  def webhook_url_unreachable?(url)
    response = Faraday.new(request: {
      timeout: REQUEST_TIMEOUT_SECONDS,
      open_timeout: OPEN_TIMEOUT_SECONDS
    }).head(url)

    response.status.to_i >= 400
  rescue Faraday::Error, URI::InvalidURIError, SocketError
    true
  end
end
