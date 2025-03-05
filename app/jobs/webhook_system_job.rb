# frozen_string_literal: true

class WebhookSystemJob < WebhookSystem::Job
  queue_as :webhooks

  def perform(subscription, event)
    super if Settings.features.webhooks_enabled
  end

  rescue_from(::WebhookSystem::Job::RequestFailed) do |error|
    Sentry.capture_exception(error)
    raise error
  end
end
