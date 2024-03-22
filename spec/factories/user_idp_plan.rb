# frozen_string_literal: true

FactoryBot.define do
  factory :user_idp_plan do
    user
    campaign
    idp_template
    creator { user }
    status { 0 }

    trait :with_skills do
      after(:create) do |user_idp_plan|
        create_list(:user_idp_skill, 3, user_idp_plan: user_idp_plan)
      end
    end
  end
end
