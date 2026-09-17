# frozen_string_literal: true

require 'rails_helper'

describe Assessments::RescoreLinkedResults do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:assessment) { create(:assessment) }
  let(:other_assessment) { create(:assessment) }
  let(:factor) { create(:factor, dimension: assessment.dimension) }
  let(:other_factor) { create(:factor, dimension: other_assessment.dimension) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:user_assessment) do
    create(
      :user_assessment,
      campaign: campaign,
      subject: user,
      evaluator: user,
      assessment: assessment,
      status: :completed,
      score_calculated: true,
      users_result: create(
        :users_result,
        without_user_assessment: true,
        scoring: { factor.id.to_s => { 'score' => 99 } }
      )
    )
  end

  let!(:assessment_campaign_factor) do
    create(
      :campaign_factor,
      campaign: campaign,
      assessment: assessment,
      factor: factor,
      code: 'reset_score',
      factor_type: :assessment,
      assessment_score_type: :score
    )
  end
  let!(:formula_campaign_factor) do
    create(
      :campaign_factor,
      campaign: campaign,
      code: 'reset_score_formula',
      factor_type: :formula,
      formula: 'return 99'
    )
  end
  let!(:manual_assessment_campaign_factor) do
    create(
      :campaign_factor,
      campaign: campaign,
      assessment: assessment,
      factor: factor,
      code: 'manual_reset_score',
      factor_type: :assessment,
      assessment_score_type: :score
    )
  end
  let!(:unrelated_campaign_factor) do
    create(
      :campaign_factor,
      campaign: campaign,
      assessment: other_assessment,
      factor: other_factor,
      code: 'unrelated_score',
      factor_type: :assessment,
      assessment_score_type: :score
    )
  end

  let!(:assessment_factor_value) do
    create(
      :campaign_factor_value,
      campaign: campaign,
      user: user,
      campaign_factor: assessment_campaign_factor,
      numeric_value: 1,
      calculation_type: :auto
    )
  end
  let!(:formula_factor_value) do
    create(
      :campaign_factor_value,
      campaign: campaign,
      user: user,
      campaign_factor: formula_campaign_factor,
      numeric_value: 1,
      calculation_type: :auto
    )
  end
  let!(:manual_assessment_factor_value) do
    create(
      :campaign_factor_value,
      campaign: campaign,
      user: user,
      campaign_factor: manual_assessment_campaign_factor,
      numeric_value: 50,
      calculation_type: :manual
    )
  end
  let!(:unrelated_factor_value) do
    create(
      :campaign_factor_value,
      campaign: campaign,
      user: user,
      campaign_factor: unrelated_campaign_factor,
      numeric_value: 100,
      calculation_type: :auto
    )
  end

  it 'recalculates assessment and formula campaign factors without changing unrelated factors' do
    described_class.call!(user_assessment)

    expect(assessment_factor_value.reload.numeric_value).to eq(99)
    expect(formula_factor_value.reload.numeric_value).to eq(99)
    expect(manual_assessment_factor_value.reload.numeric_value).to eq(50)
    expect(unrelated_factor_value.reload.numeric_value).to eq(100)
  end

  it 'removes stale automatic values while preserving manual values after an assessment reset' do
    UsersResults::Reset.call!(user_assessment)

    expect(CampaignFactorValue.find_by(id: assessment_factor_value.id)).to be_nil
    expect(manual_assessment_factor_value.reload.numeric_value).to eq(50)
    expect(manual_assessment_factor_value.calculation_type).to eq('manual')
    expect(formula_factor_value.reload.numeric_value).to eq(99)
  end

  it 'does not recalculate finalized campaign users' do
    campaign_user.update!(campaign_scores_finalized: true)

    described_class.call!(user_assessment)

    expect(assessment_factor_value.reload.numeric_value).to eq(1)
    expect(formula_factor_value.reload.numeric_value).to eq(1)
    expect(manual_assessment_factor_value.reload.numeric_value).to eq(50)
    expect(unrelated_factor_value.reload.numeric_value).to eq(100)
  end
end
