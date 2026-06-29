# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::UsersController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:campaign_assessor) { create(:assessor, user: assessor, campaign: campaign) }
  let(:user) { create(:user) }
  let(:user_id) { user.id }
  let(:campaign_id) { campaign.id }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:idp_template) { create(:idp_template) }
  let!(:campaign_factor) do
    factor = create(
      :campaign_factor, name: 'Factor', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
    factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
    factor
  end
  let!(:campaign_factor2) do
    create(
      :campaign_factor, name: 'Factor2', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
  end
  let!(:campaign_assessments) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: lead_assessment)
    create(:campaign_assessment, campaign: campaign, assessment: lead_assessment)
  end
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: assessor, campaign: campaign, subject: user, assessment: lead_assessment,
           relationship: Relationship.assessor_relationship, status: :completed, score_calculated: true)
  end
  let(:factor_id) { campaign_factor.id.to_s }
  before { sign_in(assessor) }

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/users/{user_id}/assessors_scores' do
    it 'returns assessor scores list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/users/#{user_id}/assessors_scores"

      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      cf = body['data'].first
      expect(cf).to have_attribute(:evaluator)
      expect(cf).to have_attribute(:assessment)
      expect(body['meta']['campaign_scores_finalized']).to eq(false)
    end

    it 'returns campaign_scores_finalized as true when scores are finalized' do
      campaign_user.update!(campaign_scores_finalized: true)

      get "/api/v2/administration/campaigns/#{campaign_id}/users/#{user_id}/assessors_scores"

      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      expect(body['meta']['campaign_scores_finalized']).to eq(true)
    end
  end

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/users/{user_id}/active_idp_template' do
    let!(:plan) do
      create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign, creator: superadmin)
    end

    it 'returns active IDP template' do
      sign_in(superadmin)

      get "/api/v2/administration/campaigns/#{campaign_id}/users/#{user_id}/active_idp_template"

      expect(response).to have_http_status(200)
      active_idp_template = JSON.parse(response.body)['data']

      expect(active_idp_template).to have_key('id')
      expect(active_idp_template).to have_attribute(:idp_template_id).with_value(idp_template.id)
      expect(active_idp_template).to have_attribute(:active).with_value(true)
    end
  end
end
