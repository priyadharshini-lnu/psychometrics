# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_factor_group do
    name { Faker::Lorem.word }
    campaign
    position { 1 }
  end
end
