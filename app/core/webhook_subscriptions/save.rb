# frozen_string_literal: true

module WebhookSubscriptions
  class Save < BaseCommand
    private_attr_accessor :project, :url, :webhook_subscription, :auth_enabled, :username, :password

    DEFAULT_TOPICS = %i[
      assessment_started assessment_completed assessment_timeout results_available report_available
    ].freeze

    DEFAULT_SECRET = 'default'

    def initialize(project, url, auth_enabled = false, username = nil, password = nil)
      @project = project
      @url = url
      @auth_enabled = auth_enabled
      @username = username
      @password = password
      @webhook_subscription = project.webhook_subscription
    end

    def call
      return broadcast(:ok) if url.blank? && webhook_subscription.blank?

      if url.blank?
        webhook_subscription.destroy
        return broadcast(:ok)
      end

      attributes = {
        url: url,
        auth_enabled: auth_enabled,
        username: username,
        secret: DEFAULT_SECRET,
        active: true
      }
      attributes = attributes.merge(password: nil, auth_enabled: false) if username.blank?
      attributes[:password] = password if password.present?

      if webhook_subscription.blank?
        sub = project.create_webhook_subscription(attributes)
        DEFAULT_TOPICS.each { |topic| sub.topics.create(name: topic) }
        return broadcast(:ok)
      end
      webhook_subscription.update!(attributes)
      broadcast(:ok)
    end
  end
end
