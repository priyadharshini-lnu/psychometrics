# frozen_string_literal: true

class WebhookSystemJob < WebhookSystem::Job
  include Sidekiq::Throttled::Job

  queue_as :webhooks

  sidekiq_throttle(
    threshold: {
      limit: ->(subscription_id, *) { Webhook.active.not_deleted.find(subscription_id).rate_limit || 60 },
      period: lambda { |subscription_id, *|
        (Webhook.active.not_deleted.find(subscription_id).rate_limit_period || 1).minutes
      },
      key_suffix: ->(subscription_id, *) { subscription_id }
    }
  )

  def perform(subscription_id, event)
    return unless Settings.features.webhooks_enabled

    subscription = Webhook.active.not_deleted.find(subscription_id)
    super(subscription, event)
  end

  rescue_from(::WebhookSystem::Job::RequestFailed) do |error|
    Sentry.capture_exception(error)
    raise error
  end
end
