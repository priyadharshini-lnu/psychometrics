# frozen_string_literal: true

FactoryBot.define do
  factory :webhook do
    sequence(:secret) { |n| "secret#{n}" }
    description { 'Webhook Description' }
    url { Faker::Internet.url }
    active { true }
    auth_type { 'no_auth' }

    trait :with_topics do
      transient do
        names { [] }
      end

      after(:create) do |webhook, evaluator|
        evaluator.names.each do |name|
          webhook.topics.create(name: name)
        end
      end
    end
  end
end
