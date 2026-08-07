# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignFactorsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:dimension) { create(:dimension) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factor) do
    create(
      :campaign_factor,
      name: 'Factor', campaign_factor_group_id: campaign_factor_group_id, campaign_id: campaign_id
    )
  end
  let(:factor_id) { campaign_factor.id.to_s }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_factors' do
    it 'fetches campaign factor list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors"

      expect(response).to have_http_status(:ok)
      cf = JSON.parse(response.body)['data'].first
      expect(cf).to have_attribute(:name).with_value('Factor')
      expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
      expect(cf).to have_relationship(:campaign_factor_group).
        with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
    end

    it 'returns matching factors for partial search case-insensitively' do
      create(:campaign_factor, campaign: campaign, name: 'Leadership Potential', code: 'lead_potential')
      create(:campaign_factor, campaign: campaign, name: 'Learning Agility', code: 'learn_agility')
      create(:campaign_factor, campaign: campaign, name: 'Communication', code: 'communication')

      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors",
          params: { filter: { filterable_fields: 'LEAD' } }

      expect(response).to have_http_status(:ok)

      names = JSON.parse(response.body)['data'].map { |factor| factor.dig('attributes', 'name') }
      expect(names).to include('Leadership Potential')
      expect(names).not_to include('Communication')
    end

    it 'returns empty list when no matching factor exists' do
      create(:campaign_factor, campaign: campaign, name: 'Leadership Potential', code: 'lead_potential')

      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors",
          params: { filter: { filterable_fields: 'does-not-match' } }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['data']).to eq([])
    end

    it 'returns factors only from the requested campaign scope during search' do
      other_campaign = create(:campaign)
      create(:campaign_factor_group, campaign: other_campaign)
      create(:campaign_factor, campaign: campaign, name: 'Focus', code: 'focus')
      create(:campaign_factor, campaign: other_campaign, name: 'Focus Other Campaign', code: 'focus_other')

      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors",
          params: { filter: { filterable_fields: 'focus' } }

      expect(response).to have_http_status(:ok)

      names = JSON.parse(response.body)['data'].map { |factor| factor.dig('attributes', 'name') }
      expect(names).to include('Focus')
      expect(names).not_to include('Focus Other Campaign')
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factors' do
    it 'creates campaign factor' do
      body = {
        data: {
          type: 'campaign_factors',
          attributes: {
            name: 'Factor two', position: 2, campaign_factor_group_id: campaign_factor_group_id.to_i,
            code: 'fact_code', factor_type: 'formula', public_visibility: true, output_type: 'numeric'
          },
          relationships: {
            campaign: { data: { type: 'campaigns', id: campaign_id.to_s } },
            campaign_factor_group: { data: { type: 'campaign_factor_groups', id: campaign_factor_group_id } }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      cf = JSON.parse(response.body)['data']
      expect(cf).to have_key('id')
      expect(cf).to have_attribute(:name).with_value('Factor two')
      expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
      expect(cf).to have_relationship(:campaign_factor_group).
        with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
    end
  end

  describe 'PATCH /api/v2/administration/campaigns/:campaign_id/campaign_factors/:factor_id' do
    it 'updates campaign factor' do
      body = {
        data: {
          type: 'campaign_factors',
          id: factor_id,
          attributes: {
            name: 'Updated Factor name', factor_type: 'formula', public_visibility: true, position: 2,
            campaign_factor_group_id: campaign_factor_group_id.to_i, code: 'factor_code', output_type: 'numeric'
          },
          relationships: {
            campaign: { data: { type: 'campaigns', id: campaign_id.to_s } },
            campaign_factor_group: { data: { type: 'campaign_factor_groups', id: campaign_factor_group_id } }
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors/#{factor_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      cf = JSON.parse(response.body)['data']
      expect(cf).to have_key('id')
      expect(cf).to have_attribute(:name).with_value('Updated Factor name')
      expect(cf).to have_attribute(:position).with_value(2)
      expect(cf).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s, 'type' => 'campaigns' })
      expect(cf).to have_relationship(:campaign_factor_group).
        with_data({ 'id' => campaign_factor_group_id, 'type' => 'campaign_factor_groups' })
    end
  end

  describe 'DELETE /api/v2/administration/campaigns/:campaign_id/campaign_factors/:factor_id' do
    it 'deletes campaign factor' do
      delete "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors/#{factor_id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(CampaignFactor.find_by(id: factor_id)).to eq nil
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factors/update_positions' do
    it 'updates campaign factor positions' do
      second_factor_group = create(:campaign_factor_group, campaign_id: campaign_id)
      second_factor = create(:campaign_factor, name: 'Factor 2', campaign_id: campaign_id)

      body = {
        data: [
          {
            type: 'campaign_factors',
            id: factor_id,
            attributes: { position: 2, campaign_factor_group_id: second_factor_group.id }
          },
          {
            type: 'campaign_factors',
            id: second_factor.id,
            attributes: { position: 3, campaign_factor_group_id: campaign_factor_group_id }
          }
        ]
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors/update_positions",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)['data']
      updated_factor = response_data.find { |f| f['id'] == factor_id }
      expect(updated_factor).to have_key('id')
      expect(updated_factor).to have_attribute(:name).with_value('Factor')
      expect(updated_factor).to have_attribute(:position).with_value(2)
      expect(updated_factor).to have_attribute(:campaign_factor_group_id).with_value(second_factor_group.id)
      expect(CampaignFactor.find(second_factor.id).position).to eq(3)
      expect(CampaignFactor.find(second_factor.id).campaign_factor_group_id).to eq(campaign_factor_group.id)
      expect(updated_factor).to have_relationship(:campaign).with_data({ 'id' => campaign_id.to_s,
                                                                         'type' => 'campaigns' })
      expect(updated_factor).to have_relationship(:campaign_factor_group).
        with_data({ 'id' => second_factor_group.id.to_s, 'type' => 'campaign_factor_groups' })
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factors/remove_all' do
    it 'removes all campaign factors' do
      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors/remove_all",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(campaign.campaign_factors).to be_empty
      expect(campaign.campaign_factor_groups).to be_empty
    end
  end

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_factors/validate_campaign_factor_deletion' do
    it 'returns a successful response' do
      campaign_factor = create(:campaign_factor, campaign: campaign)

      get "/api/v2/administration/campaigns/#{campaign.id}/campaign_factors/validate_campaign_factor_deletion",
          params: { id: campaign_factor.id }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        'response' => "Are you sure you want to delete the campaign factor '#{campaign_factor.name}'?"
      )
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factors/import' do
    it 'queues import_campaign_factors job successfully' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/import_campaign_factors/valid_file.xlsx'), 'application/xlsx'
      )

      post "/api/v2/administration/campaigns/#{campaign.id}/campaign_factors/import",
           params: { file: file }

      expect(AdminJobRecord.exists?(operation: 'import_campaign_factors')).to be_truthy
    end

    it 'returns validation error' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/import_campaign_factors/invalid_rows.xlsx'), 'application/xlsx'
      )

      post "/api/v2/administration/campaigns/#{campaign.id}/campaign_factors/import",
           params: { file: file }

      expect(response).to have_http_status(422)
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_factors/bulk_update' do
    it 'bulk updates campaign factors' do
      campaign_factor1 = create(:campaign_factor, campaign_id: campaign_id, name: 'Factor 1')
      campaign_factor2 = create(:campaign_factor, campaign_id: campaign_id, name: 'Factor 2')

      body = {
        data: [
          {
            type: 'campaign_factors',
            id: campaign_factor1.id.to_s,
            attributes: { name: 'Updated Factor 1', code: 'fc1' }
          },
          {
            type: 'campaign_factors',
            id: campaign_factor2.id.to_s,
            attributes: { name: 'Updated Factor 2', code: 'fc2' }
          }
        ]
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_factors/bulk_update",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      campaign_factor1.reload
      campaign_factor2.reload

      expect(campaign_factor1.name).to eq('Updated Factor 1')
      expect(campaign_factor2.name).to eq('Updated Factor 2')
      expect(campaign_factor1.code).to eq('fc1')
      expect(campaign_factor2.code).to eq('fc2')
    end
  end
end
