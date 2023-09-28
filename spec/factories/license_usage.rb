# frozen_string_literal: true

FactoryBot.define do
  factory :license_usage do
    association :license
    association :user
    association :client, factory: :tenancy

    trait :active do
      status { 'active' }
    end

    trait :updated do
      status_updated_by { user }
      status_updated_at { Time.current }
    end
  end
end
