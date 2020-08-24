# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_user do
    user
    campaign
  end
end
