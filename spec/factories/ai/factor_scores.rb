# frozen_string_literal: true

FactoryBot.define do
  factory :ai_factor_score, class: 'AI::FactorScore' do
    association :users_result, factory: :users_result
    association :factor
    question_id { nil }
    score { 3.0 }
    override_score { nil }
    confidence { 0.8 }
    citations { ['Sample citation'] }
    rationale { 'Sample rationale' }
    status { :pending }
    scoring_type { :ai }
    parent_factor { nil }
  end
end
