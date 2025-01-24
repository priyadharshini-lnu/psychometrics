# frozen_string_literal: true

FactoryBot.define do
  factory :skill do
    name { "Skill #{Faker::Lorem.characters(number: 5)}" }
    description { Faker::Lorem.sentence }
    project { Project.find(create(:project).id) }
    category { :behavioral }
  end
end
