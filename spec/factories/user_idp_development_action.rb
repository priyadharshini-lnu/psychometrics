# frozen_string_literal: true

FactoryBot.define do
  factory :user_idp_development_action do
    user_idp_plan
    user_idp_skill
    development_action
    progress { rand(0.0..5.0).round(1) }
    start_date_time { Time.zone.now }
    end_date_time { 1.day.from_now }

    trait :with_custom_development_action do
      development_action { nil }
      custom_action { Faker::Lorem.characters(number: 5) }
    end
  end
end
