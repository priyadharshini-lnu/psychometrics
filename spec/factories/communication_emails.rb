# frozen_string_literal: true

FactoryBot.define do
  factory :communication_email do
    membership
    communication { create(:communication) }
  end
end
