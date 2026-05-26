# frozen_string_literal: true

require 'rails_helper'

describe CampaignFactors::SaveAssessorScoringFactorValue do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:assessor) { create(:user, :assessor) }
  let!(:campaign_assessor) { create(:assessor, user: assessor, campaign: campaign) }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_assessments) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: lead_assessment)
    create(:campaign_assessment, campaign: campaign, assessment: lead_assessment)
  end
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: assessor, campaign: campaign, subject: user, assessment: lead_assessment,
           relationship: Relationship.assessor_relationship)
  end
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign: campaign) }
  let!(:campaign_factor) do
    factor = create(
      :campaign_factor, name: 'Factor', campaign_factor_group: campaign_factor_group,
      campaign: campaign, factor_type: :assessor_scoring
    )
    factor.campaign_factor_values.create!(campaign: campaign, numeric_value: 3, user_id: user.id)
    factor
  end
  let!(:campaign_factor2) do
    create(
      :campaign_factor, name: 'Factor2', campaign_factor_group: campaign_factor_group,
      campaign: campaign, factor_type: :assessor_scoring
    )
  end

  it 'should ignore if is not lead assessor' do
    params = {
      scores: [{
        campaign_factor_id: campaign_factor.id,
        score: 4
      }],
      user_id: user.id
    }
    assessors_user_assessment.destroy

    expect { described_class.call!(campaign, params, assessor) }.to raise_error(Pundit::NotAuthorizedError)
    expect(campaign_factor.campaign_factor_values.first.numeric_value).to eq(3)
  end

  it 'should not update scores when campaign scores are finalized' do
    create(:campaign_user, campaign: campaign, user: user, campaign_scores_finalized: true)
    params = {
      scores: [{
        campaign_factor_id: campaign_factor.id,
        score: 5
      }],
      user_id: user.id
    }

    result = described_class.call(campaign, params, assessor)

    expect(result[:error]).to eq(I18n.t('admin.scores_finalized'))
    expect(campaign_factor.campaign_factor_values.first.reload.numeric_value).to eq(3)
  end

  it 'should return error when scores include auto-moderated factors' do
    campaign_factor.update!(disallow_lead_assessor_moderation: true)
    params = {
      scores: [
        {
          campaign_factor_id: campaign_factor.id,
          score: 5
        },
        {
          campaign_factor_id: campaign_factor2.id,
          score: 2
        }
      ],
      user_id: user.id
    }

    result = described_class.call(campaign, params, assessor)

    expect(result[:error]).to eq(I18n.t('admin.auto_moderated_factor_info'))
    expect(campaign_factor.campaign_factor_values.first.reload.numeric_value).to eq(3)
    expect(campaign_factor2.campaign_factor_values.first).to be_nil
  end

  it 'should create or udpate factor values' do
    params = {
      scores: [
        {
          campaign_factor_id: campaign_factor.id,
          score: 4
        },
        {
          campaign_factor_id: campaign_factor2.id,
          score: 2
        }
      ],
      user_id: user.id
    }

    described_class.call!(campaign, params, assessor)

    expect(campaign_factor.campaign_factor_values.first.numeric_value).to eq(4)
    expect(campaign_factor.campaign_factor_values.first.calculation_type).to eq('manual')

    expect(campaign_factor2.campaign_factor_values.first).to be_present
    expect(campaign_factor2.campaign_factor_values.first.numeric_value).to eq(2)
    expect(campaign_factor2.campaign_factor_values.first.calculation_type).to eq('manual')
  end
end
