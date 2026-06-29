# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopResourcesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let(:workshop) { create(:workshop, campaign_id: campaign_id) }
  let(:workshop_id) { workshop.id }
  let!(:resource) { create(:workshop_resource, workshop: workshop) }
  let(:resource_id) { resource.id }
  before { sign_in(superadmin) }

  describe 'GET /campaigns/:campaign_id/workshops/:workshop_id/workshop_resources' do
    it 'returns workshop resources list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_resources"

      expect(response).to have_http_status(:ok)
      resource_response = JSON.parse(response.body)['data'].first
      expect(resource_response).to have_attribute(:name).with_value(resource.name)
      expect(resource_response).to have_attribute(:url).with_value(resource.url)
    end
  end

  describe 'POST /campaigns/:campaign_id/workshops/:workshop_id/workshop_resources' do
    it 'creates workshop resource' do
      body = {
        data: {
          type: 'workshop_resources',
          attributes: {
            name: 'test resource',
            url: 'http://newresource.com',
            workshop_id: workshop_id
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_resources",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      resource_response = JSON.parse(response.body)['data']
      expect(resource_response).to have_key('id')
      expect(resource_response).to have_attribute(:name).with_value('test resource')
    end
  end

  describe 'PATCH /campaigns/:campaign_id/workshops/:workshop_id/workshop_resources/:resource_id' do
    it 'updates workshop resource' do
      body = {
        data: {
          id: resource_id.to_s,
          type: 'workshop_resources',
          attributes: {
            name: 'changed resource name',
            url: 'http://newresourceurl.com',
            workshop_id: workshop_id
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/" \
            "workshop_resources/#{resource_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      resource_response = JSON.parse(response.body)['data']
      expect(resource_response).to have_attribute(:name).with_value('changed resource name')
      expect(resource_response).to have_attribute(:url).with_value('http://newresourceurl.com')
    end
  end

  describe 'DELETE /campaigns/:campaign_id/workshops/:workshop_id/workshop_resources/:resource_id' do
    it 'deletes workshop resource' do
      delete "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/" \
             "workshop_resources/#{resource_id}"

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect { WorkshopResource.find(resource_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
