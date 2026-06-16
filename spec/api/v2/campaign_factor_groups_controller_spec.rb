# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignFactorGroupsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_factor_group) { create(:campaign_factor_group, name: 'Test group', campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factors) do
    create(:campaign_factor, campaign_factor_group: campaign_factor_group, public_visibility: true)
  end
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_factor_groups' do
    it 'fetches campaign factor groups list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_groups"

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data'].first
      expect(cfg).to have_attribute(:name).with_value('Test group')
      expect(cfg).to have_relationship(:campaign).
        with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factor_groups' do
    it 'creates a campaign factor group' do
      body = {
        data: {
          type: 'campaign_factor_groups',
          attributes: {
            name: 'Test group two', position: 2
          },
          relationships: {
            campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_groups",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      cfg = JSON.parse(response.body)['data']
      expect(cfg).to have_key('id')
      expect(cfg).to have_attribute(:name).with_value('Test group two')
      expect(cfg).to have_relationship(:campaign).
        with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'PATCH /api/v2/administration/campaigns/:campaign_id/campaign_factor_groups/:campaign_factor_group_id' do
    it 'updates a campaign factor group' do
      body = {
        data: {
          type: 'campaign_factor_groups',
          id: campaign_factor_group_id,
          attributes: {
            name: 'Updated group',
            position: 2
          },
          relationships: {
            campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_groups/#{campaign_factor_group_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data']
      expect(cfg).to have_key('id')
      expect(cfg).to have_attribute(:name).with_value('Updated group')
      expect(cfg).to have_attribute(:position).with_value(2)
      expect(cfg).to have_relationship(:campaign).
        with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
    end

    it 'updates campaign factor group position' do
      body = {
        data: {
          type: 'campaign_factor_groups',
          id: campaign_factor_group_id,
          attributes: {
            name: 'Updated group', position: 2
          },
          relationships: {
            campaign: { data: { type: 'campaigns', id: campaign_id.to_s } }
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_groups/#{campaign_factor_group_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data']
      expect(cfg).to have_key('id')
      expect(cfg).to have_attribute(:name).with_value('Updated group')
      expect(cfg).to have_attribute(:position).with_value(2)
      expect(cfg).to have_relationship(:campaign).
        with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'DELETE /api/v2/administration/campaigns/:campaign_id/campaign_factor_groups/:campaign_factor_group_id' do
    it 'deletes a campaign factor group' do
      create(:campaign_factor_group, name: 'Test group 2', campaign_id: campaign_id)

      delete "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_groups/#{campaign_factor_group_id}"

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(CampaignFactorGroup.find_by(id: campaign_factor_group_id)).to eq nil
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factor_groups/initialize_scoring' do
    it 'initializes default campaign factor group and populates campaign scorings' do
      # Use a separate campaign for this test to avoid foreign key constraints
      test_campaign = create(:campaign)
      test_campaign_id = test_campaign.id

      FactoryBot.create(:assessment, dimension: Dimension.first)
      FactoryBot.create(:factor, dimension: Dimension.first, name: 'Factor - Test!_factor Name')
      FactoryBot.create(:factors_scoring, factor: Factor.first, assessment: Assessment.first)
      FactoryBot.create(:campaign_assessor_assessment, campaign: Campaign.first, assessment: Assessment.first)

      post "/api/v2/administration/campaigns/#{test_campaign_id}/campaign_factor_groups/initialize_scoring",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data']
      expect(cfg).to have_key('id')
      expect(cfg).to have_attribute(:name).with_value('Assessment Center')
      expect(cfg).to have_attribute(:position).with_value(1)
      expect(cfg).to have_relationship(:campaign).
        with_data({ 'id' => test_campaign_id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factor_groups/update_positions' do
    it 'updates campaign factor group positions' do
      another_group = create(:campaign_factor_group, name: 'Test group 2', campaign_id: campaign_id)
      new_position = 5
      body = {
        data: [
          {
            type: 'campaign_factor_groups',
            id: campaign_factor_group_id,
            attributes: { position: new_position }
          },
          {
            type: 'campaign_factor_groups',
            id: another_group.id,
            attributes: { position: new_position + 1 }
          }
        ]
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factor_groups/update_positions",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      cfg = JSON.parse(response.body)['data'].first
      expect(cfg).to have_key('id')
      expect(cfg).to have_attribute(:name).with_value('Test group')
      expect(cfg).to have_attribute(:position).with_value(5)
      expect(CampaignFactorGroup.find(another_group.id).position).to eq(6)
      expect(cfg).to have_relationship(:campaign).
        with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
    end
  end
end
