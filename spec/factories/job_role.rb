# frozen_string_literal: true

FactoryBot.define do
  factory :job_role do
    name { "Job #{Faker::Lorem.characters(number: 5)}" }
    description { Faker::Lorem.sentence }

    skills { create_list(:skill, 3) }
  end
end
