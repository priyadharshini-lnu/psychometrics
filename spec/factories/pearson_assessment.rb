# frozen_string_literal: true

FactoryBot.define do
  factory :pearson_assessment do
    product_id { Faker::Lorem.characters(number: 5) }
    title { Faker::Lorem.characters(number: 5) }
  end
end
