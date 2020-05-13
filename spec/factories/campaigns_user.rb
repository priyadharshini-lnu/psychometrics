# frozen_string_literal: true

FactoryBot.define do
  factory :campaigns_user do
    user
    campaign
  end
end
