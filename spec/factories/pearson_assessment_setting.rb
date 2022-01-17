# frozen_string_literal: true

FactoryBot.define do
  factory :pearson_assessment_setting do
    assessment
    pearson_norm_id { Faker::Lorem.characters(5) }
    pearson_assessment_id { Faker::Lorem.characters(5) }
  end
end
