# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    name { Faker::Name.name }
    project { create(:project) }
    start_date { Time.now }
    end_date { Time.now + 30.minutes }
    status { 'inactive' }
  end
end
