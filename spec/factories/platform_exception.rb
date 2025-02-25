# frozen_string_literal: true

FactoryBot.define do
  factory :platform_exception do
    identifier { "#{Faker::Lorem.words(number: 2).map(&:capitalize).join}Job" }
  end
end
