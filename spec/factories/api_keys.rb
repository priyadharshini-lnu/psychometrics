# frozen_string_literal: true

FactoryBot.define do
  factory :api_key do
    sequence(:token) { |n| "token_#{n}" }
    sequence(:key) { |n| "key_#{n}" }
    trait :with_user do
      user
    end
  end
end
