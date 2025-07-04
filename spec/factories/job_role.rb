# frozen_string_literal: true

FactoryBot.define do
  factory :job_role do
    name { "Job #{Faker::Lorem.characters(number: 5)}" }
    description { Faker::Lorem.sentence }

    trait :with_skills do
      after(:create) do |job_role|
        skills = create_list(:skill, 3)
        job_role.skills << skills
      end
    end
  end
end
