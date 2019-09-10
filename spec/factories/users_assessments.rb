# frozen_string_literal: true

FactoryGirl.define do
  factory :users_assessment do
    user
    campaign
    assessment
  end
end
