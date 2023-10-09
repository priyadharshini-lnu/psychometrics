# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_assessor do
    workshop
    user
  end
end
