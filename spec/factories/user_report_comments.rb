# frozen_string_literal: true

FactoryBot.define do
  factory :user_report_comment do
    user_report
    association :reports_module, factory: :module
    association :creator, factory: :user
    text { Faker::Lorem.characters(number: 5) }

    trait :with_parent do
      association :parent, factory: :user_report_comment
    end
  end
end
