# frozen_string_literal: true

FactoryBot.define do
  factory :users_result do
    association :subject, factory: :user
    association :evaluator, factory: :user
    assessment
    campaign
  end
end
