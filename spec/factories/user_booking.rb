# frozen_string_literal: true

FactoryBot.define do
  factory :user_booking do
    start_time { Time.zone.parse('2023-07-10 10:00') }
    end_time { Time.zone.parse('2023-07-20 11:00') }
    user
  end
end
