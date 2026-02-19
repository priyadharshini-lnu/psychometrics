# frozen_string_literal: true

FactoryBot.define do
  factory :maintenance_setting do
    sub_system { :proctoring }
    maintenance_window_enabled { false }
    time_zone { 'UTC' }
    start_time { Time.zone.now }
    end_time { 1.hour.from_now }
  end
end
