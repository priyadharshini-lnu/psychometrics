# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::UserIdpPlansController, type: :request do
  let!(:user) { create(:user) }
  let!(:idp_template) { create(:idp_template, :published) }
  let!(:campaign) { create(:campaign) }
  let!(:superadmin) { create(:superadmin) }
  let!(:idp_template1) { create(:idp_template) }
  let!(:license) { create(:license, client: campaign.client, type: :idp) }
  before { sign_in(superadmin) }

  describe 'POST /user_idp_plans' do
    it 'creates IDP Plan' do
      body = {
        data: {
          type: 'user_idp_plans',
          attributes: {
            user_id: user.id.to_s,
            idp_template_id: idp_template.id.to_s,
            campaign_id: campaign.id.to_s,
            creator_id: superadmin.id.to_s
          }
        }
      }

      post '/api/v2/administration/user_idp_plans',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      idp_plan_response = JSON.parse(response.body)['data']
      expect(idp_plan_response).to have_attribute(:user_id).with_value(user.id)
      expect(idp_plan_response).to have_attribute(:idp_template_id).with_value(idp_template.id)
      expect(idp_plan_response).to have_attribute(:campaign_id).with_value(campaign.id)
      expect(idp_plan_response).to have_attribute(:active).with_value(true)
      expect(idp_plan_response).to have_attribute(:creator_id).with_value(superadmin.id)
    end

    it 'returns error when IDP Plan creation fails due to existing plan' do
      create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign, creator: superadmin)

      body = {
        data: {
          type: 'user_idp_plans',
          attributes: {
            user_id: user.id.to_s,
            idp_template_id: idp_template.id.to_s,
            campaign_id: campaign.id.to_s,
            creator_id: superadmin.id.to_s
          }
        }
      }

      post '/api/v2/administration/user_idp_plans',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      error_response = JSON.parse(response.body)['errors']
      expect(error_response.first['title']).to eq('This Idp Template is already assiged to this user and is active')
      expect(error_response.first['status']).to eq('422')
    end

    it 'activates existing inactive User IDP Plan' do
      create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign, creator: superadmin,
active: false)
      create(:user_idp_plan, user: user, idp_template: idp_template1, campaign: campaign, creator: superadmin)

      body = {
        data: {
          type: 'user_idp_plans',
          attributes: {
            user_id: user.id.to_s,
            idp_template_id: idp_template.id.to_s,
            campaign_id: campaign.id.to_s,
            creator_id: superadmin.id.to_s
          }
        }
      }

      post '/api/v2/administration/user_idp_plans',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      idp_plan_response = JSON.parse(response.body)['data']
      expect(idp_plan_response).to have_attribute(:user_id).with_value(user.id)
      expect(idp_plan_response).to have_attribute(:idp_template_id).with_value(idp_template.id)
      expect(idp_plan_response).to have_attribute(:campaign_id).with_value(campaign.id)
      expect(idp_plan_response).to have_attribute(:active).with_value(true)
      expect(idp_plan_response).to have_attribute(:creator_id).with_value(superadmin.id)
    end
  end

  describe 'POST /user_idp_plans/:id/reset' do
    it 'resets the User IDP Plan' do
      user_idp_plan = create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign,
                             creator: superadmin, approval_status: 'draft', completion_status: 'in_progress')
      create_list(:user_idp_skill, 3, user_idp_plan: user_idp_plan)

      post "/api/v2/administration/user_idp_plans/#{user_idp_plan.id}/reset",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(user_idp_plan.reload.user_idp_skills).to be_empty
      expect(user_idp_plan.approval_status).to eq('not_started')
      expect(user_idp_plan.completion_status).to eq('not_started')
      expect(response).to have_http_status(:ok)
      expect(response.body).to eq('"ok"')
    end
  end
end
