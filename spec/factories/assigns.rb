# frozen_string_literal: true

FactoryGirl.define do
  factory :assign do
    membership
    assessment { membership.client.assessments.take }

    factory :assign_assessment do
      association :profile, factory: :assessment
    end

    trait :with_assign_reports do
      after(:create) do |instance|
        create_list :assigns_report, 2, :licensed, assign: instance
      end
    end
  end
end
