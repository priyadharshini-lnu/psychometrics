# frozen_string_literal: true

FactoryBot.define do
  factory :sms_invite do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    mobile_no { "+#{Faker::Number.number(12)}" }
    locale { 'en' }
    code { Faker::Lorem.characters(5) }
    status { 0 }
    campaign
    association :creator, factory: :user
  end
end
