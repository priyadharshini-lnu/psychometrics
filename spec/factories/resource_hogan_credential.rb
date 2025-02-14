# frozen_string_literal: true

FactoryBot.define do
  factory :resource_hogan_credential do
    association :resource, factory: :user_assessment # or :user_report
    association :hogan_credential
  end
end
