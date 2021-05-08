# frozen_string_literal: true

FactoryBot.define do
  factory :webhook_subscription, class: WebhookSystem::Subscription do
    sequence(:secret) { |n| "secret#{n}" }
    active { true }
  end
end
