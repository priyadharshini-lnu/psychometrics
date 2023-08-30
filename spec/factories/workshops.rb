# frozen_string_literal: true

FactoryBot.define do
  factory :workshop do
    campaign
    name { Faker::Lorem.word }
    start_time { Time.current }
    timezone { 'Asia/Dubai' }
    duration { 14_400 }
    total_seats { 10 }
  end

  trait :with_managers do
    managers { [create(:user)] }
  end

  trait :with_assessors do
    assessors { [create(:user)] }
  end
end
