# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::GetAssessmentScore do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:factor) { create(:factor) }
  let!(:assessment) { create(:assessment, dimension: factor.dimension) }
  let!(:user_assessment) do
    create(:user_assessment, evaluator: user, subject: user, assessment: assessment,
                                  campaign: campaign, status: :completed)
  end

  let!(:score_source) do
    # rubocop:disable Style/OpenStructUse
    [
      OpenStruct.new(
        assessment_id: assessment.id,
        factor_id: factor.id,
        assessment_score_type: 'score'
      )
    ]
    # rubocop:enable all
  end

  it 'returns assessment score' do
    user_assessment.result.update(scoring: { factor.id.to_s => { 'score' => 2 } })

    user_assessment_scores = described_class.call!(
      campaign, user, score_source
    )

    expect(user_assessment_scores).to eq({
      { assessment_id: assessment.id, factor_id: factor.id, assessment_score_type: 'score' } => 2
    })
  end
end
