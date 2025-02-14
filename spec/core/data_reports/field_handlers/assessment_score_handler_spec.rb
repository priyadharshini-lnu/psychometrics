# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::AssessmentScoreHandler do
  let!(:campaign) { create(:campaign) }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) { create(:user_assessment, subject: user, assessment: assessment, status: :completed) }

  let!(:factor) { create(:factor) }

  let!(:users_result) do
    create(:users_result, user_assessment: user_assessment,
           scoring: { factor.id.to_s => { score: 3.0, norm_score: 3.0, percentage: 3.0, zscore: 3.0,
                                          results: [{ value: 3.0, question_id: 1 }] } })
  end

  %w[score zscore norm_score percentage].each do |score_type|
    let!(:score_field) { { 'score_type' => score_type, 'assessment_id' => assessment.id, 'factor_id' => factor.id } }

    it ".call #{score_type}" do
      expect(described_class.call!(score_field, campaign_user: campaign_user)).to eq(3.0)
    end
  end
end
