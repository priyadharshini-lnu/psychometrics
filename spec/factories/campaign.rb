# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    name { Faker::Name.name }
    project { create(:project) }
    start_date { Time.zone.now }
    end_date { 30.minutes.from_now }
    status { 'inactive' }
    type { :common }

    trait :threesixty do
      type { Campaign::THREESIXTY }
    end

    trait :with_subjects do
      subjects { build_list(:threesixty_subject, 1) }
    end
  end
end
