# frozen_string_literal: true

FactoryBot.define do
  factory :sms_history do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    mobile_no { "+#{Faker::Number.number(digits: 12)}" }
    association :sms_record
  end
end
