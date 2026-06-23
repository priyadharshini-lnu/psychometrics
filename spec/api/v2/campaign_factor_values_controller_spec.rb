# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignFactorValuesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:campaign_assessor) { create(:assessor, user: assessor, campaign: campaign) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:campaign_id) { campaign.id }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factor) do
    factor = create(
      :campaign_factor, name: 'Factor', code: 'factor1', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
    factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
    factor
  end
  let!(:campaign_factor2) do
    create(
      :campaign_factor, name: 'Factor2', code: 'factor2', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
  end

  let!(:campaign_factor_with_formula) do
    create(:campaign_factor, campaign: campaign, output_type: :numeric,
            factor_type: :formula, code: 'factor3', formula: 'return __factor1 + __factor2')
  end

  let!(:campaign_assessments) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: lead_assessment)
    create(:campaign_assessment, campaign: campaign, assessment: lead_assessment)
  end
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: assessor, campaign: campaign, subject: user, assessment: lead_assessment,
           relationship: Relationship.assessor_relationship)
  end
  let(:factor_id) { campaign_factor.id.to_s }

  before { sign_in(assessor) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_factor_values' do
    it 'fetches campaign factors list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_values",
          params: { 'filter[user_id_eq]' => user.id }

      expect(response).to have_http_status(:ok)
      cf = JSON.parse(response.body)['data'].first
      expect(cf).to have_attribute(:numeric_value).with_value(3)
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/' \
           'campaign_factor_values/save_assessor_scoring_factor_value' do
    it 'updates campaign factor value' do
      body = {
        data: {
          type: 'campaign_factor_values',
          attributes: {
            scores: [{
              campaign_factor_id: campaign_factor.id,
              score: 4
            }, {
              campaign_factor_id: campaign_factor2.id,
              score: 2
            }],
            user_id: user.id
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_values/" \
           "save_assessor_scoring_factor_value?filter[user_id_eq]=#{user.id}",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      factor_value = campaign_factor.campaign_factor_values.find_by(user_id: user.id)
      factor_value2 = campaign_factor2.campaign_factor_values.find_by(user_id: user.id)
      calculated_factor = campaign_factor_with_formula.campaign_factor_values.find_by(user_id: user.id)

      expect(factor_value.numeric_value).to eq(4)
      expect(factor_value2).to be_present
      expect(factor_value2.numeric_value).to eq(2)

      expect(calculated_factor.numeric_value).to eq(6)
    end
  end
end
