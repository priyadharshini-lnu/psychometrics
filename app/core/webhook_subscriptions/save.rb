# frozen_string_literal: true

module WebhookSubscriptions
  class Save < BaseCommand
    private_attr_accessor :project, :url, :webhook_subscription, :username, :password

    DEFAULT_TOPICS = %i[
      assessment_started assessment_completed assessment_timeout results_available report_available
    ].freeze

    DEFAULT_SECRET = 'default'

    def initialize(project, url, username = nil, password = nil)
      @project = project
      @url = url
      @username = username
      @password = password
      @webhook_subscription = project.webhooks.first
    end

    def call
      return broadcast(:ok) if url.blank? && webhook_subscription.blank?

      if url.blank?
        webhook_subscription.destroy
        return broadcast(:ok)
      end

      attributes = {
        url: url,
        username: username,
        secret: DEFAULT_SECRET,
        active: true,
        auth_type: 'no_auth',
        description: 'default'
      }
      attributes = if username.blank?
                     attributes.merge(password: nil)
                   else
                     attributes.merge(auth_type: 'basic_auth')
                   end
      attributes[:password] = password if password.present?

      if webhook_subscription.blank?
        sub = project.webhooks.create(attributes)
        DEFAULT_TOPICS.each { |topic| sub.topics.create(name: topic) }
        return broadcast(:ok)
      end
      webhook_subscription.update!(attributes)
      broadcast(:ok)
    end
  end
end
