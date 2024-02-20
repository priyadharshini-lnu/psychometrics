# frozen_string_literal: true

FactoryBot.define do
  factory :admin_role do
    name { 'Admin Role' }
    description { Faker::Lorem.sentence }
  end
end
