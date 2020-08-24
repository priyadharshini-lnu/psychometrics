# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_assessment do
    campaign
    assessment
  end
end
