# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::CanAutoFinalizeCampaignScores do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:factor1) { create(:factor) }

  let!(:campaign_factor) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring, factor: factor1)
  end

  let(:assessor_assessment) { create(:assessment, category: :assessor_form) }
  let!(:question) { create(:question, assessment_id: assessor_assessment.id) }

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

  let!(:factors_scoring) do
    FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_user_assessment.assessment)
    create(:campaign_factor_value, campaign_factor: campaign_factor, user: user, campaign: campaign, numeric_value: 10)
  end

  it 'should return false if assessor assessments pending' do
    second_assessor_user_assessment.update(status: :in_progress)

    expect(described_class.call!(campaign, campaign_user, user)).to eq(false)
  end

  it 'should return true if assessor assessments completed' do
    expect(described_class.call!(campaign, campaign_user, user)).to eq(true)
  end

  it 'should return true if assessor assessments doesnt have any questions' do
    second_assessor_user_assessment.update(status: :in_progress)
    assessor_assessment.questions.destroy_all

    expect(described_class.call!(campaign, campaign_user, user)).to eq(true)
  end

  it 'should return false if campaign_factor_value is not calculated' do
    campaign_factor.campaign_factor_values.destroy_all

    expect(described_class.call!(campaign, campaign_user, user)).to eq(false)
  end

  it 'should ignore soft-deleted questions when checking for incomplete assessments' do
    question.update(deleted_at: Time.current)
    second_assessor_user_assessment.update(status: :in_progress)

    expect(described_class.call!(campaign, campaign_user, user)).to eq(true)
  end
end
