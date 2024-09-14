# frozen_string_literal: true

require 'rails_helper'

describe CampaignFactors::CalculateAssessorScoringFactor do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:factor1) { create(:factor) }
  let(:factor2) { create(:factor) }

  let!(:campaign_factor) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring, factor: factor1)
  end

  let!(:campaign_factor2) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring, factor: factor2)
  end

  let(:assessor_assessment) { create(:assessment, category: :assessor_form) }

  let!(:assessor_user_assessment) do
    create(:user_assessment, campaign: campaign, subject: user,
      assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)
  end

  let!(:second_assessor_user_assessment) do
    create(:user_assessment, campaign: campaign, subject: user,
      assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)
  end

  let!(:users_result) do
    assessor_user_assessment.users_result.update!(
      scoring: {
        factor1.id.to_s => { 'norm_score' => 3 },
        factor2.id.to_s => { 'norm_score' => 5 }
      }
    )
  end

  let!(:users_result2) do
    second_assessor_user_assessment.users_result.update!(
      scoring: {
        factor1.id.to_s => { 'norm_score' => 2 },
        factor2.id.to_s => { 'norm_score' => 4 }
      }
    )
  end

  let!(:factors_scoring) do
    FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_user_assessment.assessment)
    FactoryBot.create(:factors_scoring, factor: factor2, assessment: assessor_user_assessment.assessment)
  end

  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }

  it 'should ignore if auto moderation if lead assessor assigned' do
    create(:user_assessment, evaluator: create(:user, :assessor), campaign: campaign, subject: user,
      assessment: lead_assessment, relationship: Relationship.assessor_relationship)

    campaign_factor_values = described_class.call!(campaign, user)

    expect(campaign_factor_values).to be_empty
  end

  it 'should ignore if auto moderation if assessor assessment is pending' do
    second_assessor_user_assessment.update(status: :in_progress)

    campaign_factor_values = described_class.call!(campaign, user)

    expect(campaign_factor_values).to be_empty
  end

  it 'should return calculated factor value with averaged scores' do
    campaign_factor_values = described_class.call!(campaign, user)

    expect(campaign_factor_values[campaign_factor].value).to eq(2.5)
    expect(campaign_factor_values[campaign_factor2].value).to eq(4.5)
  end

  context 'factors with factor weights' do
    let!(:factor_weight1) do
      create(:campaign_assessor_assessment_factor_weight, campaign: campaign, assessment: assessor_assessment,
      factor_id: factor1.id, weight: 0.5)
    end

    let!(:factor_weight2) do
      create(:campaign_assessor_assessment_factor_weight, campaign: campaign, assessment: assessor_assessment,
       factor_id: factor2.id, weight: 1.5)
    end

    it 'should return calculated factor value with weighted average scores' do
      campaign_factor_values = described_class.call!(campaign, user)

      expect(campaign_factor_values[campaign_factor].value).to eq(1.25)
      expect(campaign_factor_values[campaign_factor2].value).to eq(6.75)
    end
  end
end
