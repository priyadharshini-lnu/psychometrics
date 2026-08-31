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
    c1 = create(:sheet_column, sheet: datasheet, name: 'Grade', column_type: 'string')
    c2 = create(:sheet_column, sheet: datasheet, name: 'Previous Score', column_type: 'number')
    r1 = create(:sheet_row, email: user.email, sheet: datasheet)
    create(:sheet_row_datum, sheet_row: r1, sheet_column: c1, string_value: 'Senior')
    create(:sheet_row_datum, sheet_row: r1, sheet_column: c2, numeric_value: 10)

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

    # Verify record was updated, not destroyed
    updated_cfv = CampaignFactorValue.find_by(id: campaign_factor_value.id)
    expect(updated_cfv).to eq(campaign_factor_value)
    expect(updated_cfv.numeric_value).to eq(2)

    expect(indexed_campaign_factor_values[cf_factor1.id].value).to eq(2)
    expect(indexed_campaign_factor_values[cf_factor2.id].value).to eq(4.8)
    expect(indexed_campaign_factor_values[cf_factor3.id].value).to eq('Senior')
    expect(indexed_campaign_factor_values[cf_factor4.id].value).to eq(10)
    expect(indexed_campaign_factor_values[cf_factor5.id].value).to eq(((2 + 4.8) / 2) + (10 * 0.5))
  end

  it 'updates existing auto-calculated factor values in-place' do
    cf_factor = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'score'
    )
    existing_value = create(
      :campaign_factor_value, campaign_factor: cf_factor, user: user, campaign: campaign,
      numeric_value: 0, calculation_type: :auto
    )
    original_id = existing_value.id

    described_class.call!(campaign, user)

    reloaded_value = CampaignFactorValue.find_by(id: original_id)
    expect(reloaded_value).to_not be_nil
    expect(reloaded_value.id).to eq(original_id)
    expect(reloaded_value.numeric_value).to eq(2)
    expect(reloaded_value.calculation_type).to eq('auto')
  end

  it 'preserves manual factor values and their calculation_type during rescore' do
    cf_factor = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessor_scoring', assessment_score_type: 'score'
    )
    manual_value = create(
      :campaign_factor_value, campaign_factor: cf_factor, user: user, campaign: campaign,
      numeric_value: 50, calculation_type: :manual
    )

    described_class.call!(campaign, user)

    reloaded_value = CampaignFactorValue.find_by(id: manual_value.id)
    expect(reloaded_value).to_not be_nil
    expect(reloaded_value.numeric_value).to eq(50)
    expect(reloaded_value.calculation_type).to eq('manual')
  end

  it "doesn't remove manually saved factor with type assessor_scoring " do
    cf_factor = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessor_scoring', assessment_score_type: 'score'
    )
    campaign_factor_value = create(
      :campaign_factor_value, campaign_factor: cf_factor, user: user, campaign: campaign, numeric_value: 100,
      calculation_type: 'manual'
    )

    described_class.call!(campaign, user)

    cfv = CampaignFactorValue.find_by(id: campaign_factor_value.id)
    expect(cfv).to_not eq(nil)
    expect(cfv.numeric_value).to eq(100)
  end

  it "doesn't remove factor with type external_score" do
    cf_factor = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'external_score'
    )
    campaign_factor_value = create(
      :campaign_factor_value, campaign_factor: cf_factor, user: user, campaign: campaign, numeric_value: 100,
      calculation_type: 'manual'
    )

    described_class.call!(campaign, user)

    cfv = CampaignFactorValue.find_by(id: campaign_factor_value.id)
    expect(cfv).to_not eq(nil)
    expect(cfv.numeric_value).to eq(100)
  end

  it 'calls publish_campaign_results_available if all scores were calculated and finalized' do
    campaign_user.update!(campaign_scores_finalized: false)
    create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'norm_score'
    )
    expect_any_instance_of(CampaignUser).to receive(:publish_campaign_results_available).once
    described_class.call!(campaign, user)

    expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
  end
end
