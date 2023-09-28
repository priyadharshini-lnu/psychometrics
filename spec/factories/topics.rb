# frozen_string_literal: true

FactoryBot.define do
  factory :topic, class: WebhookSystem::SubscriptionTopic do
    name { :assessment_started }
  end
end
