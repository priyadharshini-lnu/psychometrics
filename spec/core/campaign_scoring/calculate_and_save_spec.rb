# frozen_string_literal: true

require 'rails_helper'

describe CampaignScoring::CalculateAndSave do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:user) { create(:user) }
  let(:factor1) { create(:factor, dimension: assessment.dimension) }
  let(:factor2) { create(:factor, dimension: assessment.dimension) }
  let!(:users_result) do
    scoring = {}
    scoring[factor1.id.to_s] = { 'norm_score' => 1, 'score' => 2 }
    scoring[factor2.id.to_s] = { 'norm_score' => 4.8, 'score' => 5 }
    create(
      :users_result, campaign: campaign, assessment: assessment,
      scoring: scoring, subject: user, evaluator: user, status: :completed
    )
  end

  it 'saves campaign factor values' do
    create(:campaign_user, campaign: campaign, user: user)
    datasheet = create(:datasheet, campaign: campaign)
    create(:sheet_row, email: user.email, sheet: datasheet, data: { 'Grade' => 'Senior', 'Previous Score' => 10 })
    cf_factor1 = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'score'
    )
    cf_factor2 = create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
      factor_type: 'assessment', assessment_score_type: 'norm_score'
    )
    cf_factor3 = create(
      :campaign_factor, code: 'grade', campaign: campaign, factor_type: 'formula',
      output_type: 'string', formula: "return datasheet.value('Grade')"
    )
    cf_factor4 = create(
      :campaign_factor, code: 'previous_score', campaign: campaign, factor_type: 'formula',
      output_type: 'numeric', formula: "return datasheet.value('Previous Score')"
    )
    cf_factor5 = create(
      :campaign_factor, campaign: campaign, factor_type: 'formula',
      formula: %{
        previous_score = __previous_score
        if __grade == 'Senior' then
          previous_score = previous_score * 0.5
        end
        avg_factor_score = (__factor1 + __factor2) / 2
        return avg_factor_score + previous_score
      }
    )
    cf_factor6 = create(
      :campaign_factor, code: 'helpers_percentile', campaign: campaign, factor_type: 'formula',
      output_type: 'numeric', formula: 'return helpers.percentile(2.165)'
    )
    cf_factor7 = create(
      :campaign_factor, code: 'helpers_round', campaign: campaign, factor_type: 'formula',
      output_type: 'numeric', formula: 'return helpers.round(2.165, 2)'
    )

    campaign_factor_values, = described_class.call!(campaign, user)
    indexed_campaign_factor_values = campaign_factor_values.index_by(&:campaign_factor_id)

    expect(indexed_campaign_factor_values[cf_factor1.id].value).to eq(2)
    expect(indexed_campaign_factor_values[cf_factor2.id].value).to eq(4.8)
    expect(indexed_campaign_factor_values[cf_factor3.id].value).to eq('Senior')
    expect(indexed_campaign_factor_values[cf_factor4.id].value).to eq(10)
    expect(indexed_campaign_factor_values[cf_factor5.id].value).to eq(((2 + 4.8) / 2) + (10 * 0.5))
    expect(indexed_campaign_factor_values[cf_factor6.id].value).to eq(98.5)
    expect(indexed_campaign_factor_values[cf_factor7.id].value).to eq(2.17)
  end

  it 'saves campaign factor values' do
    create(:campaign_user, campaign: campaign, user: user, campaign_scores_finalized: true)
    cf_factor = create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'norm_score'
    )
    create(:campaign_factor_value, campaign_factor: cf_factor, user: user, campaign: campaign, numeric_value: 100)
    described_class.call!(campaign, user)

    expect(cf_factor.campaign_factor_values.find_by(user: user).value).to eq(100)
  end

  it "doesn't recompute already computed factor" do
    create(:campaign_user, campaign: campaign, user: user)
    cf_factor1 = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'score'
    )
    create(:campaign_factor_value, campaign_factor: cf_factor1, user: user, campaign: campaign, numeric_value: 10)

    campaign_factor_values, = described_class.call!(campaign, user)

    indexed_campaign_factor_values = campaign_factor_values.index_by(&:campaign_factor_id)
    expect(indexed_campaign_factor_values[cf_factor1.id].value).to eq(10)
  end

  it 'mark campaign_scores_finalized if all scores were calculated' do
    campaign_user = create(:campaign_user, campaign: campaign, user: user, campaign_scores_finalized: false)
    create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'norm_score'
    )
    described_class.call!(campaign, user)

    expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
  end

  it 'does not mark campaign_scores_finalized if all scores were calculated' do
    campaign_user = create(:campaign_user, campaign: campaign, user: user, campaign_scores_finalized: false)
    create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'norm_score', output_type: 'string'
    )
    described_class.call!(campaign, user)

    expect(campaign_user.reload.campaign_scores_finalized).to eq(false)
  end
end
