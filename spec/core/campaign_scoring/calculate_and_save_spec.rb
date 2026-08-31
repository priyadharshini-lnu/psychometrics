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
      scoring: scoring, subject: user, evaluator: user, status: :completed,
      score_calculated: true
    )
  end

  it 'handles concurrent calls without duplicate key errors' do
    Redlock::Client.testing_mode = :run

    create(:campaign_user, campaign: campaign, user: user)
    cf_factor = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'score'
    )

    CampaignFactorValue.where(campaign: campaign, user: user).destroy_all

    errors = []
    barrier = Concurrent::CyclicBarrier.new(3) # All 3 threads wait until all are ready

    threads = Array.new(3) do
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          barrier.wait # Force all threads to start simultaneously
          described_class.call!(campaign.reload, user.reload)
        end
      rescue ActiveRecord::RecordNotUnique => e
        errors << e
      end
    end

    threads.each(&:join)

    Redlock::Client.testing_mode = :bypass

    expect(errors).to be_empty, "Race condition occurred: #{errors.map(&:message).join(', ')}"
    expect(CampaignFactorValue.where(campaign: campaign, user: user, campaign_factor: cf_factor).count).to eq(1)
  end

  it 'saves campaign factor values' do
    create(:campaign_user, campaign: campaign, user: user)
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

  it 'auto moderate assessor assessments and save campaign factor values' do
    create(:campaign_user, campaign: campaign, user: user)

    cf_factor1 = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: :assessor_scoring, assessment_score_type: 'score'
    )
    cf_factor2 = create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor2,
      factor_type: :assessor_scoring, assessment_score_type: 'score'
    )

    assessor_assessment = create(:assessment, category: :assessor_form)

    assessor_user_assessment = create(:user_assessment, campaign: campaign, subject: user,
      assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)

    assessor_user_assessment.users_result.update!(
      scoring: {
        factor1.id.to_s => { 'score' => 3 },
        factor2.id.to_s => { 'score' => 5 }
      }
    )

    second_assessor_user_assessment = create(:user_assessment, campaign: campaign, subject: user,
      assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)

    second_assessor_user_assessment.users_result.update!(
      scoring: {
        factor1.id.to_s => { 'score' => 2 },
        factor2.id.to_s => { 'score' => 4 }
      }
    )

    FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_user_assessment.assessment)
    FactoryBot.create(:factors_scoring, factor: factor2, assessment: second_assessor_user_assessment.assessment)

    create(:campaign_assessor_assessment_factor_weight, campaign: campaign, assessment: assessor_assessment,
      factor_id: factor1.id, weight: 0.5)

    described_class.call!(campaign, user)

    expect(cf_factor1.campaign_factor_values.find_by(user: user).numeric_value).to eq(1.25)
    expect(cf_factor2.campaign_factor_values.find_by(user: user).numeric_value).to eq(4.5)
  end

  it 'removes stale auto-moderated factor value when assessor evaluations are reset and rescored' do
    campaign_user = create(:campaign_user, campaign: campaign, user: user)

    cf_factor1 = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: :assessor_scoring, assessment_score_type: 'score'
    )

    assessor_assessment = create(:assessment, category: :assessor_form)
    assessor_user_assessment = create(:user_assessment, campaign: campaign, subject: user,
      assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)
    assessor_user_assessment.users_result.update!(scoring: { factor1.id.to_s => { 'score' => 3 } })
    FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_user_assessment.assessment)

    # Auto-moderation produces and stores the factor value.
    described_class.call!(campaign, user)
    expect(cf_factor1.campaign_factor_values.find_by(user: user).numeric_value).to eq(3)

    # Simulate resetting the assessor evaluation: the scoring is cleared.
    assessor_user_assessment.update!(status: :not_started)
    assessor_user_assessment.users_result.update!(scoring: nil)

    campaign_user.reload.update!(campaign_scores_finalized: false, campaign_scores_finalized_date: nil)

    # Rescoring from the scoring tab uses force_recalculate.
    described_class.call!(campaign, user, force_recalculate: true)

    expect(cf_factor1.campaign_factor_values.find_by(user: user)).to be_nil
  end

  it 'keeps a manual (lead assessor moderated) factor value when recalculation yields no value' do
    create(:campaign_user, campaign: campaign, user: user)

    cf_factor1 = create(
      :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: :assessor_scoring, assessment_score_type: 'score'
    )
    create(:campaign_factor_value, campaign_factor: cf_factor1, user: user, campaign: campaign,
      numeric_value: 7, calculation_type: :manual)

    described_class.call!(campaign, user, force_recalculate: true)

    expect(cf_factor1.campaign_factor_values.find_by(user: user).numeric_value).to eq(7)
  end

  it 'calls publish_campaign_results_available if all scores were calculated and finalized' do
    campaign_user = create(:campaign_user, campaign: campaign, user: user, campaign_scores_finalized: false)
    create(
      :campaign_factor, code: 'factor2', campaign: campaign, assessment: assessment, factor: factor1,
      factor_type: 'assessment', assessment_score_type: 'norm_score'
    )
    expect_any_instance_of(CampaignUser).to receive(:publish_campaign_results_available).once
    described_class.call!(campaign, user)

    expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
  end
end
