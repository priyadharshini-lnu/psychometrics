# frozen_string_literal: true

module WebhookSubscriptions
  class Save < BaseCommand
    private_attr_accessor :project, :url, :webhook_subscription

    DEFAULT_TOPICS = %i[
      assessment_started assessment_completed assessment_timeout results_available report_available
    ].freeze

    DEFAULT_SECRET = 'default'

    def initialize(project, url)
      @project = project
      @url = url
      @webhook_subscription = project.webhook_subscription
    end

    def call
      return broadcast(:ok) if url.blank? && webhook_subscription.blank?

      if url.blank?
        webhook_subscription.destroy
        return broadcast(:ok)
      end

      if webhook_subscription.blank?
        sub = project.create_webhook_subscription(url: url, secret: DEFAULT_SECRET, active: true)
        DEFAULT_TOPICS.each { |topic| sub.topics.create(name: topic) }
        return broadcast(:ok)
      end

      webhook_subscription.update!(url: url)
      broadcast(:ok)
    end
  end
end
