# frozen_string_literal: true

FactoryBot.define do
  factory :job_group do
    sequence(:name) { |n| "Job Group #{n}" }
    association :project

    trait :with_parent do
      parent { association :job_group }
    end
  end
end
