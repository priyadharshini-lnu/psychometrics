# frozen_string_literal: true

FactoryBot.define do
  factory :campaign do
    name { Faker::Name.name }
    project { create(:project) }
  end
end
