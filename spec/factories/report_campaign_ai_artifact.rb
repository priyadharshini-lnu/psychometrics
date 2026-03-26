# frozen_string_literal: true

FactoryBot.define do
  factory :report_campaign_ai_artifact, class: 'Reports::CampaignAIArtifact' do
    code { SecureRandom.hex(10) }
    name { Faker::Name.unique.name }
    ai_assistant { association(:assistant) }
    report
  end
end
