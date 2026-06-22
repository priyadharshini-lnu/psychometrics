# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::NormalizeFactorScores do
  it 'does not normalize score if project assessment is not present' do
    factor = create(:factor)
    user_result = create(:users_result, scoring: { factor.id.to_s => { score: 2.3 } })

    described_class.call!(user_result.user_assessment)
    expect(UserAssessmentFactorScore.exists?(factor: factor)).to eq(false)
  end

  it 'does not normalize score if normalize_factor_scores is false for project assessment' do
    factor = create(:factor)
    user_result = create(:users_result, scoring: { factor.id.to_s => { score: 2.3 } })
    create(
      :project_assessment,
      project_id: user_result.campaign.project_id,
      assessment_id: user_result.assessment_id,
      normalize_factor_scores: false
    )

    described_class.call!(user_result.user_assessment)
    expect(UserAssessmentFactorScore.exists?(factor: factor)).to eq(false)
  end

  it 'does not normalize score if user assessment does not have scoring data' do
    factor = create(:factor)
    user_result = create(:users_result)

    described_class.call!(user_result.user_assessment)
    expect(UserAssessmentFactorScore.exists?(factor: factor)).to eq(false)
  end

  it 'normalizes different types of scores' do
    factors = create_list(:factor, 2)
    factor1_score = { 'score' => 2.3, 'norm_score' => 3, 'zscore' => 5.3, 'percentage' => 90 }
    factor2_score = { 'score' => 4, 'norm_score' => 3.2, 'zscore' => 5, 'percentage' => 100 }
    user_result = create(
      :users_result,
      scoring: {
        factors[0].id.to_s => factor1_score,
        factors[1].id.to_s => factor2_score
      }
    )
    create(
      :project_assessment,
      project_id: user_result.campaign.project_id,
      assessment_id: user_result.assessment_id,
      normalize_factor_scores: true
    )

    described_class.call!(user_result.user_assessment)

    factor1_uafs = UserAssessmentFactorScore.find_by(factor: factors[0])
    factor2_uafs = UserAssessmentFactorScore.find_by(factor: factors[1])
    expect(factor1_uafs.scores).to eq(factor1_score)
    expect(factor2_uafs.scores).to eq(factor2_score)
    expect(factor1_uafs.tenant_id).to eq(user_result.user_assessment.tenant_id)
    expect(factor2_uafs.tenant_id).to eq(user_result.user_assessment.tenant_id)
  end

  it "delete factor scores is scoring columns doesn't have scores" do
    factors = create_list(:factor, 2)
    factor1_score = { 'score' => 2.3, 'norm_score' => 3, 'zscore' => 5.3, 'percentage' => 90 }
    user_result = create(
      :users_result,
      scoring: {
        factors[0].id.to_s => factor1_score
      }
    )
    create(
      :project_assessment,
      project_id: user_result.campaign.project_id,
      assessment_id: user_result.assessment_id,
      normalize_factor_scores: true
    )

    described_class.call!(user_result.user_assessment)

    factor1_uafs = UserAssessmentFactorScore.find_by(factor: factors[0])
    factor2_uafs = UserAssessmentFactorScore.find_by(factor: factors[1])
    expect(factor1_uafs.scores).to eq(factor1_score)
    expect(factor2_uafs).to eq(nil)
  end
end
