# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::CampaignIdpsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:idp_template) { create(:idp_template) }
  let!(:idp_template2) { create(:idp_template, :published) }
  let(:user) { create(:user) }
  let(:campaign_id) { campaign.id }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_idps' do
    it 'fetches campaign IDP list' do
      create(:campaign_idp, campaign: campaign, idp_template: idp_template)

      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_idps"

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data'].first
      expect(d).to have_relationship(:idp_template)
      expect(d).to have_relationship(:campaign)
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_idps' do
    it 'creates campaign IDP without job' do
      body = {
        data: {
          type: 'campaign_idps',
          attributes: {
            override_exists: false,
            automatically_assign_new: true
          },
          relationships: {
            campaign: {
              data: {
                type: 'campaigns',
                id: campaign.id.to_s
              }
            },
            idp_template: {
              data: {
                type: 'idp_templates',
                id: idp_template2.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_idps",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      d = JSON.parse(response.body)['data']
      expect(d).to have_relationship(:idp_template)
      expect(d).to have_relationship(:campaign)
      expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
      expect(AdminJobRecord.count).to eq(0)
    end

    it 'creates campaign IDP with job when override exists' do
      body = {
        data: {
          type: 'campaign_idps',
          attributes: {
            override_exists: true,
            automatically_assign_new: true
          },
          relationships: {
            campaign: {
              data: {
                type: 'campaigns',
                id: campaign.id.to_s
              }
            },
            idp_template: {
              data: {
                type: 'idp_templates',
                id: idp_template2.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_idps",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      d = JSON.parse(response.body)['data']
      expect(d).to have_relationship(:idp_template)
      expect(d).to have_relationship(:campaign)
      expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
      expect(AdminJobRecord.count).to eq(1)
      expect(AdminJobRecord.last.operation).to eq('assign_idp_to_users')
    end
  end

  describe 'PATCH /api/v2/administration/campaigns/:campaign_id/campaign_idps/:id' do
    it 'updates campaign IDP without job' do
      campaign_idp = create(:campaign_idp, campaign: campaign, idp_template: idp_template)

      body = {
        data: {
          id: campaign_idp.id.to_s,
          type: 'campaign_idps',
          attributes: {
            override_exists: false,
            automatically_assign_new: true
          },
          relationships: {
            campaign: {
              data: {
                type: 'campaigns',
                id: campaign.id.to_s
              }
            },
            idp_template: {
              data: {
                type: 'idp_templates',
                id: idp_template2.id.to_s
              }
            }
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_idps/#{campaign_idp.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data']
      expect(d).to have_relationship(:idp_template)
      expect(d).to have_relationship(:campaign)
      expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
      expect(AdminJobRecord.count).to eq(0)
    end

    it 'updates campaign IDP with job when override exists' do
      campaign_idp = create(:campaign_idp, campaign: campaign, idp_template: idp_template)

      body = {
        data: {
          id: campaign_idp.id.to_s,
          type: 'campaign_idps',
          attributes: {
            override_exists: true,
            automatically_assign_new: true
          },
          relationships: {
            campaign: {
              data: {
                type: 'campaigns',
                id: campaign.id.to_s
              }
            },
            idp_template: {
              data: {
                type: 'idp_templates',
                id: idp_template2.id.to_s
              }
            }
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/campaign_idps/#{campaign_idp.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data']
      expect(d).to have_relationship(:idp_template)
      expect(d).to have_relationship(:campaign)
      expect(d.dig('relationships', 'idp_template', 'data', 'id')).to eq(idp_template2.id.to_s)
      expect(AdminJobRecord.count).to eq(1)
      expect(AdminJobRecord.last.operation).to eq('assign_idp_to_users')
    end
  end
end
