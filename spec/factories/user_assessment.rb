# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment do
    campaign
    evaluator { create(:user) }
    subject { create(:user) }

    trait :with_relationship do
      relationship
    end
  end
end
