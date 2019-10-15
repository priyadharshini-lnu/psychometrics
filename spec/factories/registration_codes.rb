# frozen_string_literal: true

FactoryGirl.define do
  factory :registration_code do
    name 'TTE Registration Code'
    code 'tte-2019'
    total_count 1000
    use_count 546
    association :end_level, factory: :project
    project { end_level.project }
    start_date '2019-10-01 00:00:00'
    end_date '2021-10-31 00:00:00'
    disabled false
  end
end
