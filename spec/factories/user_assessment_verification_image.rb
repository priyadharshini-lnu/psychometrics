# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment_verification do
    association :user_assessment
  end
end
