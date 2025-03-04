# frozen_string_literal: true

FactoryBot.define do
  factory :skill_alias do
    association :client
    association :skill # Let the factory accept a skill instead of creating one
    name { Faker::Lorem.word }
  end
end
