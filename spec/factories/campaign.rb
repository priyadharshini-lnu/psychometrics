# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    name { Faker::Name.name }
    project { create(:project) }
    start_date { Time.now }
    end_date { 30.minutes.from_now }
    status { 'inactive' }
  end
end
