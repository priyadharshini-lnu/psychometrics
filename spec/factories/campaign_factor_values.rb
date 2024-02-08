# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_factor_value do
    campaign
    user
    campaign_factor
    numeric_value { 1 }
  end
end
