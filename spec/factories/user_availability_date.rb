# frozen_string_literal: true

FactoryBot.define do
  factory :user_availability_date do
    timezone { 'Asia/Muscat' }
    start_date { Date.parse('2023-07-10') }
    end_date { Date.parse('2023-07-20') }
    user
  end
end
