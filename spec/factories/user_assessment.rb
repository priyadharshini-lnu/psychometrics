# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment do
    campaign
    users_result
    assessment
    evaluator { create(:user) }
    subject { create(:user) }

    trait :with_relationship do
      relationship
    end

    trait :with_result do
      transient do
        status { :completed }
      end

      after(:create) do |ua, evaluator|
        ua.users_result.update_columns(status: evaluator.status)
      end
    end
  end
end
