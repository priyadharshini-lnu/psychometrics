# frozen_string_literal: true

FactoryGirl.define do
  factory :campaigns_user do
    user
    campaign
  end
end
