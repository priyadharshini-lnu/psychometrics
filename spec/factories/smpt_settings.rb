# frozen_string_literal: true

FactoryBot.define do
  factory :smtp_setting do
    from_email { Faker::Internet.email }
    from_name { Faker::Name.name }
    host { Faker::Internet.host }
    encryption { 1 }
    port { 1 }
    user_name { Faker::Internet.user_name }
    password { Faker::Internet.password }
    authentication_type { 1 }
  end
end
