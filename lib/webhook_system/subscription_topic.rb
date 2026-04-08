# frozen_string_literal: true

module WebhookSystem
  class SubscriptionTopic < ApplicationRecord
    self.table_name = 'webhook_subscription_topics'

    validates :name, presence: true

    belongs_to :subscription, class_name: 'WebhookSystem::Subscription'
  end
end
