# frozen_string_literal: true

require 'rails_helper'

describe Idp::GetUserSkillScore do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:factor) { create(:factor) }
  let!(:assessment) { create(:assessment, dimension: factor.dimension) }
  let!(:idp_template_skill) { create(:idp_template_skill, campaign_factor_code: 'code') }
  let!(:idp_template_skill2) do
    create(:idp_template_skill, scoring_source: :assessment,
                                      assessment_id: assessment.id, factor_id: factor.id)
  end
  let!(:user_assessment) { create(:user_assessment, evaluator: user, assessment: assessment) }

  it 'returns the campaign factor score' do
    campaign_factor_values = { 'code' => 2.3 }
    score = described_class.call!(user, idp_template_skill, campaign_factor_values, {})
    expect(score).to eq(2.3)
  end

  it 'returns assessment score' do
    user_assessment_scores = {
      {
        assessment_id: assessment.id,
        factor_id: factor.id,
        assessment_score_type: idp_template_skill2.assessment_score_type
      } => 2
    }
    score = described_class.call!(user, idp_template_skill2, {}, user_assessment_scores)
    expect(score).to eq(2)
  end
end
