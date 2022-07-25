# frozen_string_literal: true

FactoryBot.define do
  factory :sms_record do
    message { Faker::Lorem.characters(number: 5) }
    link_expiry { DateTime.now }
    campaign
    association :creator, factory: :user
    filters { {} }
  end
end
