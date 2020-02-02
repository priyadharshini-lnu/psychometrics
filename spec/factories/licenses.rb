# frozen_string_literal: true

FactoryGirl.define do
  factory :license do
    number 100
    report_family
    start_date { Date.today }
    end_date { Date.today + 10.days }

    factory :threesixty_license do
      used_number 10
      type 'threesixty'
    end
  end
end
