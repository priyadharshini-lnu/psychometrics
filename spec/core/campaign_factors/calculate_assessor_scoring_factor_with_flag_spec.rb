# frozen_string_literal: true

require 'rails_helper'

describe 'CampaignFactors::CalculateAssessorScoringFactor with disallow_lead_assessor_moderation' do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:factor1) { create(:factor) }
  let(:factor2) { create(:factor) }

  let!(:auto_moderated_factor) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring,
           factor: factor1, disallow_lead_assessor_moderation: true, assessment_score_type: :score)
  end

  let!(:manual_moderated_factor) do
    create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring,
           factor: factor2, disallow_lead_assessor_moderation: false, assessment_score_type: :score)
  end

  let(:assessor_assessment) { create(:assessment, category: :assessor_form) }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }

  let!(:assessor_user_assessment) do
    create(:user_assessment, campaign: campaign, subject: user,
      assessment: assessor_assessment, relationship: Relationship.assessor_relationship, status: :completed)
  end

  let!(:users_result) do
    assessor_user_assessment.users_result.update!(
      scoring: {
        factor1.id.to_s => { 'score' => 3 },
        factor2.id.to_s => { 'score' => 5 }
      }
    )
  end

  let!(:factors_scoring) do
    FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_assessment)
    FactoryBot.create(:factors_scoring, factor: factor2, assessment: assessor_assessment)
  end

  context 'when lead assessor is present and disallow_lead_assessor_moderation is true' do
    before do
      create(:user_assessment, evaluator: create(:user, :assessor), campaign: campaign, subject: user,
        assessment: lead_assessment, relationship: Relationship.assessor_relationship)
    end

    it 'should auto-moderate only factors with disallow_lead_assessor_moderation enabled' do
      campaign_factor_values = CampaignFactors::CalculateAssessorScoringFactor.call!(campaign, user)

      # Auto-moderated factor should be calculated
      expect(campaign_factor_values[auto_moderated_factor]).to be_present
      expect(campaign_factor_values[auto_moderated_factor].value).to eq(3.0)

      # Manually moderated factor should not be calculated
      expect(campaign_factor_values[manual_moderated_factor]).to be_nil
    end
  end

  context 'when no lead assessor is present' do
    it 'should auto-moderate all assessor_scoring factors regardless of flag' do
      campaign_factor_values = CampaignFactors::CalculateAssessorScoringFactor.call!(campaign, user)

      # Both factors should be calculated
      expect(campaign_factor_values[auto_moderated_factor]).to be_present
      expect(campaign_factor_values[auto_moderated_factor].value).to eq(3.0)

      expect(campaign_factor_values[manual_moderated_factor]).to be_present
      expect(campaign_factor_values[manual_moderated_factor].value).to eq(5.0)
    end
  end
end
