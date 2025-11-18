# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_ai_artifact_result, class: 'AI::CampaignArtifactResult' do
    association :user

    checkpoint { {} }
    meta { {} }

    # Handle both assistable and campaign_ai_artifact parameters
    transient do
      campaign_ai_artifact { nil }
    end

    assistable { campaign_ai_artifact || create(:campaign_ai_artifact) }
  end
end
