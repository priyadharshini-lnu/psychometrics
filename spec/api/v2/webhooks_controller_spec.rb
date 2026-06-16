# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WebhooksController, type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:webhook) { create(:webhook, project_id: project.id) }
  let!(:webhook_id) { webhook.id }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /projects/:project_id/webhooks' do
    it 'returns webhook list' do
      get "/api/v2/administration/projects/#{project_id}/webhooks"

      expect(response).to have_http_status(:ok)
      webhooks = JSON.parse(response.body)
      webhook_response = webhooks['data'].find { |c| c['id'] == webhook.id.to_s }
      expect(webhook_response).to have_key('id')
      expect(webhook_response).to have_attribute(:url).with_value(webhook.url)
    end
  end

  describe 'POST /projects/:project_id/webhooks' do
    it 'creates a webhook' do
      body = {
        data: {
          type: 'webhooks',
          attributes: {
            description: 'webhook description',
            url: 'http://www.dummy_webhook.com',
            active: false,
            auth_type: 'no_auth',
            username: 'Jon',
            rate_limit: 100,
            rate_limit_period: 1
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/webhooks", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      webhook_response = JSON.parse(response.body)['data']
      expect(webhook_response).to have_key('id')
      expect(webhook_response).to have_attribute(:url).with_value('http://www.dummy_webhook.com')
      expect(webhook_response).to have_attribute(:description).with_value('webhook description')
      expect(webhook_response).to have_attribute(:active).with_value(false)
      expect(webhook_response).to have_attribute(:auth_type).with_value('no_auth')
      expect(webhook_response).to have_attribute(:username).with_value('Jon')
    end
  end

  describe 'PATCH /projects/:project_id/webhooks/:webhook_id' do
    it 'updates a webhook' do
      body = {
        data: {
          type: 'webhooks',
          id: webhook.id.to_s,
          attributes: {
            description: 'webhook description',
            active: true,
            auth_type: 'no_auth',
            url: 'http://www.dummy_webhook_url.com'
          }
        }
      }

      patch "/api/v2/administration/projects/#{project_id}/webhooks/#{webhook_id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      webhook_response = JSON.parse(response.body)['data']
      expect(webhook_response).to have_key('id')
      expect(webhook_response).to have_attribute(:description).with_value('webhook description')
      expect(webhook_response).to have_attribute(:url).with_value('http://www.dummy_webhook_url.com')
    end
  end
end
