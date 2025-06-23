# frozen_string_literal: true

FactoryBot.define do
  factory :taxonomy_level do
    association :project

    hierarchy_type { %w[job_group skill_group].sample }
    depth { Faker::Number.between(from: 0, to: 3) }
    label { Faker::Lorem.words(number: 2).join(' ') }
  end
end
