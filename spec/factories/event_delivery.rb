# frozen_string_literal: true

FactoryBot.define do
  factory :event_delivery do
    delivery_type { :email }
  end
end
