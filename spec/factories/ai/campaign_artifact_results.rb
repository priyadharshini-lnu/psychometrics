# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_ai_artifact_result, class: 'AI::CampaignArtifactResult' do
    association :user
    association :campaign_ai_artifact, factory: :campaign_ai_artifact
    results { {} }
    error { nil }
  end
end
