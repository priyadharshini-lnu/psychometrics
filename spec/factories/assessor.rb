# frozen_string_literal: true

FactoryBot.define do
  factory :assessor do
    user
    campaign
  end
end
