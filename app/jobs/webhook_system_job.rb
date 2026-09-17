# frozen_string_literal: true

class WebhookSystemJob < WebhookSystem::Job
  EXECUTIONS_TO_RETRY_TIMING = {
    1 => 1.minute + rand(10..60).seconds,
    2 => 5.minutes + rand(10..60).seconds,
    3 => 15.minutes + rand(10..60).seconds
  }.freeze

  include Sidekiq::Throttled::Job

  queue_as :webhooks

  retry_on WebhookSystem::Job::RequestFailed, attempts: 4,
    wait: ->(executions) { EXECUTIONS_TO_RETRY_TIMING[executions] }

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
    # Re-evaluate suppression at delivery time so events queued before a campaign's
    # disable_webhooks flag was toggled on are still blocked
    return if WebhookSubscriptions::DeliverySuppressed.suppressed?(event)

    subscription = Webhook.active.not_deleted.find(subscription_id)
    super(subscription, event)
  end
end
