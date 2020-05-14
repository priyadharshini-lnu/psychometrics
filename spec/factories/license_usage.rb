# frozen_string_literal: true

FactoryBot.define do
  factory :license_usage do
    association :client, factory: :tenancy
  end
end
