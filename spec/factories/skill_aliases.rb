# frozen_string_literal: true

FactoryBot.define do
  factory :skill_alias do
    association :client
    association :skill
    name { "Skill Alias #{Faker::Lorem.characters(number: 5)}" }
  end
end
