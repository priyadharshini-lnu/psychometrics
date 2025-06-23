# frozen_string_literal: true

FactoryBot.define do
  factory :skills_job_role do
    job_role
    skill
    expected_proficiency_level { rand(1..5) }
  end
end
