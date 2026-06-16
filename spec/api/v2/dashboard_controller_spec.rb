# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DashboardsController, type: :request do
  let!(:dashboard) { create(:dashboard) }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /dashboards' do
    it 'returns dashboards list' do
      get '/api/v2/administration/dashboards'

      expect(response).to have_http_status(:ok)
      dashboards = JSON.parse(response.body)
      dashboard_response = dashboards['data'].find { |d| d['id'] == dashboard.id.to_s }
      expect(dashboard_response).to have_key('id')
      expect(dashboard_response).to have_attribute(:name).with_value(dashboard.name)
      expect(dashboard_response).to have_relationship(:campaign).
        with_data({ 'id' => dashboard.campaign_id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'GET /dashboards/:dashboard_id' do
    it 'returns dashboard' do
      test_dashboard = create(:dashboard)

      get "/api/v2/administration/dashboards/#{test_dashboard.id}"

      expect(response).to have_http_status(:ok)
      dashboard_response = JSON.parse(response.body)['data']
      expect(dashboard_response).to have_key('id')
      expect(dashboard_response).to have_attribute(:name).with_value(test_dashboard.name)
      expect(dashboard_response).to have_relationship(:campaign).
        with_data({ 'id' => test_dashboard.campaign_id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'POST /dashboards' do
    it 'creates a dashboard' do
      campaign = create(:campaign)
      body = {
        data: {
          type: 'dashboards',
          attributes: {
            dashboard_type: 'powerbi',
            name: 'New Dashboard',
            enabled: true,
            dataset_id: 'd_100',
            report_id: 'r_100'
          },
          relationships: {
            campaign: {
              data: {
                id: campaign.id.to_s,
                type: 'campaigns'
              }
            }
          }
        }
      }

      post '/api/v2/administration/dashboards', params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      dashboard_response = JSON.parse(response.body)['data']
      expect(dashboard_response).to have_key('id')
      expect(dashboard_response).to have_attribute(:name).with_value('New Dashboard')
      expect(dashboard_response).to have_attribute(:enabled).with_value(true)
      expect(dashboard_response).to have_attribute(:dataset_id).with_value('d_100')
      expect(dashboard_response).to have_attribute(:report_id).with_value('r_100')
      expect(dashboard_response).to have_relationship(:campaign).
        with_data({ 'id' => campaign.id.to_s, 'type' => 'campaigns' })
    end
  end

  describe 'PATCH /dashboards/:dashboard_id' do
    it 'updates a dashboard' do
      test_dashboard = create(:dashboard)
      campaign = test_dashboard.campaign
      body = {
        data: {
          type: 'dashboards',
          id: test_dashboard.id.to_s,
          attributes: {
            name: 'New Dashboard1',
            enabled: true,
            dataset_id: 'd_200',
            report_id: 'r_200'
          },
          relationships: {
            campaign: {
              data: {
                id: campaign.id.to_s,
                type: 'campaigns'
              }
            }
          }
        }
      }

      patch "/api/v2/administration/dashboards/#{test_dashboard.id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      dashboard_response = JSON.parse(response.body)['data']
      expect(dashboard_response).to have_key('id')
      expect(dashboard_response).to have_attribute(:name).with_value('New Dashboard1')
      expect(dashboard_response).to have_attribute(:enabled).with_value(true)
      expect(dashboard_response).to have_attribute(:dataset_id).with_value('d_200')
      expect(dashboard_response).to have_attribute(:report_id).with_value('r_200')
      expect(dashboard_response).to have_relationship(:campaign).
        with_data({ 'id' => campaign.id.to_s, 'type' => 'campaigns' })
    end
  end
end
