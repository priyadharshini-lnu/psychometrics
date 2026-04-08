# frozen_string_literal: true

FactoryBot.define do
  factory :system_check_session do
    user

    trait :completed do
      finished_at { Time.zone.now }
    end

    trait :in_progress do
      finished_at { nil }
    end

    trait :with_all_passed_records do
      after(:create) do |session|
        SystemCheckRecord.check_types.each_key do |check_type|
          create(:system_check_record, check_type, system_check_session: session, passed: true)
        end
      end
    end

    trait :with_failed_records do
      after(:create) do |session|
        create(:system_check_record, :browser, system_check_session: session, passed: false)
        create(:system_check_record, :network, system_check_session: session, passed: true)
      end
    end
  end
end
