# frozen_string_literal: true

require 'rails_helper'

describe CampaignFactors::CanCalculateAssessorScoringFactor do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:factor1) { create(:factor) }

  let!(:campaign_factor) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring, factor: factor1)
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
        factor1.id.to_s => { 'norm_score' => 3 }
      }
    )
  end

  let!(:users_result2) do
    second_assessor_user_assessment.users_result.update!(
      scoring: {
        factor1.id.to_s => { 'norm_score' => 2 }
      }
    )
  end

  let(:factor_with_sub_factors) { create(:factor) }
  let!(:sub_factor) { create(:factor) }

  let!(:campaign_factor_with_sub_factors) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring, factor: factor_with_sub_factors)
  end

  let!(:factor_sub_factor) { create(:factors_sub_factor, factor: factor_with_sub_factors, sub_factor: sub_factor) }

  let(:another_assessor_assessment) { create(:assessment, category: :assessor_form) }

  let!(:third_assessor_user_assessment) do
    create(:user_assessment, campaign: campaign, subject: user,
      assessment: another_assessor_assessment, relationship: Relationship.assessor_relationship, status: :in_progress)
  end

  let!(:factors_scoring) do
    FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_user_assessment.assessment)
    FactoryBot.create(:factors_scoring, factor: sub_factor, assessment: another_assessor_assessment)
  end

  it 'should return false if assessor assessments with campaign factor in check pending' do
    second_assessor_user_assessment.update(status: :in_progress)

    expect(described_class.call!(campaign_factor, user)).to eq(false)
  end

  it 'should return true if assessor assessments with campaign factor in check completed' do
    expect(described_class.call!(campaign_factor, user)).to eq(true)
  end

  it 'should return false if assessor assessment with campaign factor with sub factors pending' do
    third_assessor_user_assessment.users_result.update!(scoring: {})

    expect(described_class.call!(campaign_factor_with_sub_factors, user)).to eq(false)
  end

  it 'should return true if assessor assessment with campaign factor with sub factors completed' do
    third_assessor_user_assessment.complete!

    expect(described_class.call!(campaign_factor_with_sub_factors, user)).to eq(true)
  end
end
