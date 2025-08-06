# frozen_string_literal: true

FactoryBot.define do
  factory :license do
    number { 100 }
    report_family
    start_date { Time.zone.today }
    end_date { Time.zone.today + 10.days }

    association :client, factory: :tenancy

    factory :threesixty_license do
      used_number { 10 }
      type { 'threesixty' }
    end

    factory :proctoring_license do
      used_number { 0 }
      type { 'proctoring' }
    end

    factory :ai_assistant_license do
      used_number { 0 }
      type { 'ai_assistant' }
    end
  end
end
