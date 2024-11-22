# frozen_string_literal: true

FactoryBot.define do
  factory :oracle_credential do
    idcs_user_id { Faker::Number.number(digits: 10) }
    idcs_user_name { Faker::Internet.email }
    user
  end
end
