# frozen_string_literal: true

FactoryGirl.define do
  factory :license do
    number 100
    report_family
    start_date { Date.today }
    end_date { Date.today + 10.days }
  end
end
