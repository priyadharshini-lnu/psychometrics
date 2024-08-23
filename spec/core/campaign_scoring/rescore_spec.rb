# frozen_string_literal: true

require 'rails_helper'

describe CampaignScoring::Rescore do
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:factor1) { create(:factor, dimension: assessment.dimension) }
  let(:factor2) { create(:factor, dimension: assessment.dimension) }
  let!(:users_result) do
    scoring = {}
    scoring[factor1.id.to_s] = { 'norm_score' => 1, 'score' => 2 }
    scoring[factor2.id.to_s] = { 'norm_score' => 4.8, 'score' => 5 }
    create(
      :users_result, campaign: campaign, assessment: assessment,
      scoring: scoring, subject: user, evaluator: user, status: :completed, score_calculated: true
    )
  end

  it 'saves campaign factor values' do
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
    campaign_factor_value = create(
      :campaign_factor_value, campaign_factor: cf_factor1, user: user, campaign: campaign, numeric_value: 100
    )

    campaign_factor_values = described_class.call!(campaign, user)
    indexed_campaign_factor_values = campaign_factor_values.index_by(&:campaign_factor_id)

    expect(CampaignFactorValue.find_by(id: campaign_factor_value.id)).to eq(nil)
    expect(indexed_campaign_factor_values[cf_factor1.id].value).to eq(2)
    expect(indexed_campaign_factor_values[cf_factor2.id].value).to eq(4.8)
    expect(indexed_campaign_factor_values[cf_factor3.id].value).to eq('Senior')
    expect(indexed_campaign_factor_values[cf_factor4.id].value).to eq(10)
    expect(indexed_campaign_factor_values[cf_factor5.id].value).to eq(((2 + 4.8) / 2) + (10 * 0.5))
  end

  it "doesn't remove already computed factor with type assessor_scoring" do
    cf_factor = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessor_scoring', assessment_score_type: 'score'
    )
    campaign_factor_value = create(
      :campaign_factor_value, campaign_factor: cf_factor, user: user, campaign: campaign, numeric_value: 100
    )

    described_class.call!(campaign, user)

    cfv = CampaignFactorValue.find_by(id: campaign_factor_value.id)
    expect(cfv).to_not eq(nil)
    expect(cfv.numeric_value).to eq(100)
  end
end
