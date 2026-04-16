# frozen_string_literal: true

FactoryBot.define do
  factory :system_check_record do
    system_check_session
    check_type { :browser }
    passed { false }
    data { {} }

    trait :browser do
      check_type { :browser }
    end

    trait :network do
      check_type { :network }
      data do
        if passed
          { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 15 }
        else
          { 'download_speed_mbps' => 5, 'upload_speed_mbps' => 5 }
        end
      end
    end

    trait :video do
      check_type { :video }
    end

    trait :audio do
      check_type { :audio }
    end

    trait :passed do
      passed { true }
    end

    trait :failed do
      passed { false }
    end

    trait :completed do
      passed { true }
      finished_at { Time.zone.now }
    end
  end
end
