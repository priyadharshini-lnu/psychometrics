# frozen_string_literal: true

FactoryGirl.define do
  factory :users_result do
    association :subject, factory: :user
    association :evaluator, factory: :user
    assessment
    campaign
  end
end
