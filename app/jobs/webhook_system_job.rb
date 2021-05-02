# frozen_string_literal: true

class WebhookSystemJob < ::WebhookSystem::Job
  queue_as :webhooks

  rescue_from(::WebhookSystem::Job::RequestFailed) do |error|
    Sentry.capture_exception(error)
    raise error
  end
end
