# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_assessor_assessment_factor_weight do
    campaign
    assessment
    factor
    weight { 0.5 }
  end
end
