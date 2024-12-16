# frozen_string_literal: true

FactoryBot.define do
  factory :last_job_run do
    name { "#{Faker::Lorem.words(number: 2).map(&:capitalize).join}Job" }

    trait :completed_yesterday do
      started_at { 1.day.ago }
      finished_at { 1.day.ago }
    end
  end
end
