# frozen_string_literal: true

FactoryBot.define do
  factory :user_availability_day do
    day { 1 }
    start_time { '06:00' }
    end_time { '08:00' }
    user_availability_date
  end
end
