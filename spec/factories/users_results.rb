# frozen_string_literal: true

FactoryBot.define do
  factory :users_result do
    transient do
      subject { create(:user) }
      evaluator { create(:user) }
      assessment { create(:assessment) }
      campaign { create(:campaign) }
      relationship { nil }
      subject_id { nil }
      evaluator_id { nil }
      assessment_id { nil }
      campaign_id { nil }
      status { 0 }
      score_calculated { false }
      without_user_assessment { nil }
    end

    after(:create) do |users_result, attrs|
      next if attrs.without_user_assessment

      create(:user_assessment,
             users_result: users_result,
             subject_id: attrs.subject_id || attrs.subject.id,
             evaluator_id: attrs.evaluator_id || attrs.evaluator.id,
             assessment_id: attrs.assessment_id || attrs.assessment.id,
             campaign_id: attrs.campaign_id || attrs.campaign.id,
             relationship: attrs.relationship,
             status: attrs.status,
             score_calculated: attrs.score_calculated)
    end
  end
end
