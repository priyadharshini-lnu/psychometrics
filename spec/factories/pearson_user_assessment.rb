# frozen_string_literal: true

FactoryBot.define do
  factory :pearson_user_assessment do
    user_assessment
    schedule_id { Faker::Lorem.characters(number: 5) }
  end
end
