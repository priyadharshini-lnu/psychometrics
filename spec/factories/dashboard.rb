# frozen_string_literal: true

FactoryBot.define do
  factory :dashboard do
    name { Faker::Name.name }
    association :campaign
  end
end
