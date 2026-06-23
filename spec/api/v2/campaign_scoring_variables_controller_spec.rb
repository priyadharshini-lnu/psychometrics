# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignScoringVariablesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_options) { campaign.campaign_options }
  let(:campaign_option_id) { campaign_options.id.to_s }
  before do
    campaign_options.update(campaign_scoring_variables: 'test = 1')
    sign_in(superadmin)
  end

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_scoring_variables' do
    it 'fetches campaign scoring variables' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_scoring_variables"

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data'].first
      expect(cfg).to have_attribute(:variables).with_value('test = 1')
    end
  end

  describe 'PATCH /api/v2/administration/campaigns/:campaign_id/campaign_scoring_variables/:campaign_option_id' do
    it 'updates campaign scoring variables successfully' do
      body = {
        data: {
          type: 'campaign_scoring_variables',
          id: campaign_option_id,
          attributes: {
            variables: 'test = 2'
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_scoring_variables/#{campaign_option_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data']
      expect(cfg).to have_key('id')
      expect(cfg).to have_attribute(:variables).with_value('test = 2')
    end

    it 'returns validation error for invalid variables' do
      body = {
        data: {
          type: 'campaign_scoring_variables',
          id: campaign_option_id,
          attributes: {
            variables: "test = 2\ntest2 = afd3"
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_scoring_variables/#{campaign_option_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      expect(errors.first['title']).to eq("invalid statement 'test2 = afd3' on line number 2")
    end
  end
end
