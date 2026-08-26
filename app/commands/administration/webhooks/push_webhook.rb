# frozen_string_literal: true

module Administration
  module Webhooks
    class PushWebhook < Rectify::Command
      private_attr_reader :subscription, :event

      def initialize(subscription, event)
        @subscription = subscription
        @event = event
      end

      def call
        return broadcast(:ok) if WebhookSubscriptions::DeliverySuppressed.suppressed?(event)

        ::WebhookSystem::Job.perform_now(subscription, event)
      rescue ::WebhookSystem::Job::RequestFailed => e
        broadcast(:error, I18n.t('administration.webhook.request_failure', http_status_code: e.code))
      rescue Faraday::ConnectionFailed, Faraday::TimeoutError, Faraday::SSLError
        broadcast(:error, I18n.t('administration.webhook.connection_failure'))
      else
        broadcast(:ok)
      end
    end
  end
end
