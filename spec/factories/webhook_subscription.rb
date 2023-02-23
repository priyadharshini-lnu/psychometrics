# frozen_string_literal: true

FactoryBot.define do
  factory :webhook do
    sequence(:secret) { |n| "secret#{n}" }
    description { 'Webhook Description' }
    url { Faker::Internet.url }
    active { true }
    auth_type { 'no_auth' }
  end
end
