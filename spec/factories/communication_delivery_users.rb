# frozen_string_literal: true

FactoryBot.define do
  factory :communication_delivery_user do
    communication_delivery
    user
  end
end
