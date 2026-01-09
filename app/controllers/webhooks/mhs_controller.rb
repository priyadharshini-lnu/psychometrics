# frozen_string_literal: true

module Webhooks
  class MhsController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def webhook
      case request.method
        when 'HEAD'
          handle_head_request
        when 'OPTIONS'
          handle_webhook_verification
        when 'POST'
          handle_webhook_event
        else
          head :method_not_allowed
      end
    end

    private

    def handle_head_request
      response.headers['Cache-Control'] = 'no-cache, no-store'
      head :ok
    end

    def handle_webhook_verification
      # https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/http-webhook.md#41-validation-request
      response.headers['WebHook-Allowed-Origin'] = request.headers['Origin'] || '*'
      response.headers['WebHook-Allowed-Rate'] = '1000'
      response.headers['Access-Control-Allow-Origin'] = '*'
      response.headers['Access-Control-Allow-Methods'] = 'HEAD, POST, OPTIONS'
      response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

      head :ok
    end

    def handle_webhook_event
      response.headers['WebHook-Allowed-Origin'] = request.headers['Origin'] || '*'

      Rails.logger.info("Received MHS webhook payload: #{request.raw_post}")
      Rails.logger.info("Headers: #{request.headers.to_h.select { |k, _| k.start_with?('HTTP_') }}")

      head :ok
    end
  end
end
