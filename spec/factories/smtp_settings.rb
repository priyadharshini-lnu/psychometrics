# frozen_string_literal: true

FactoryBot.define do
  factory :smtp_setting do
    enabled { true }
    from_email { Faker::Internet.email }
    from_name { Faker::Name.name }
    host { Faker::Internet.domain_name }
    encryption { 1 }
    port { 1 }
    user_name { Faker::Internet.user_name }
    password { Faker::Internet.password }
    authentication_type { 1 }
  end
end
