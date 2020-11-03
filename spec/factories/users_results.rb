# frozen_string_literal: true

FactoryBot.define do
  factory :users_result do
    association :subject, factory: :user
    association :evaluator, factory: :user
    assessment
    campaign

    trait :with_user_assessment do
      after(:create) do |users_result|
        create :user_assessment, assessment_id: users_result.assessment_id, users_result: users_result
      end
    end
  end
end
