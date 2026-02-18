# frozen_string_literal: true

FactoryBot.define do
  factory :ai_scoring_approval_setting, class: 'AI::ScoringApprovalSetting' do
    campaign
    assessment
  end
end
