# frozen_string_literal: true

FactoryGirl.define do
  factory :api_key do
    trait :with_user do
      user
    end
  end
end
