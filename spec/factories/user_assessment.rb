# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment do
    campaign
    users_result { create(:users_result, without_user_assessment: true) }
    assessment
    evaluator { create(:user) }
    subject { create(:user) }

    trait :with_relationship do
      relationship
    end

    trait :with_hogan_assessment do
      association :assessment, factory: :assessment_hogan
    end

    trait :with_result do
      transient do
        answers { {} }
      end

      after(:create) do |ua, evaluator|
        ua.users_result.update_columns(answers: evaluator.answers)
      end
    end
  end
end
