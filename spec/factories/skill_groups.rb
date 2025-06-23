# frozen_string_literal: true

FactoryBot.define do
  factory :skill_group do
    sequence(:name) { |n| "Skill Group #{n}" }
    association :project

    trait :with_parent do
      parent { association :skill_group }
    end
  end
end
