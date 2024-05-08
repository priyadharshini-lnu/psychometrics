# frozen_string_literal: true

FactoryBot.define do
  factory :hogan_credential do
    password { Faker::Internet.password }
    participant_id { Faker::Number.number(digits: 10) }
    provider { Settings.secrets.hogan[:default_provider] }
    user
  end
end
