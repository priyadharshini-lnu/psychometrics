# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::LicenseUsagesController, type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:license) { create(:license, client: client) }
  let!(:usage) { create(:license_usage, :active, :updated, license: license, client: client) }
  let(:client_id) { client.id.to_s }
  let(:license_id) { license.id.to_s }
  let(:license_usage_id) { usage.id }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/clients/:client_id/licenses/:license_id/license_usages' do
    it 'returns license usages list' do
      get "/api/v2/administration/clients/#{client_id}/licenses/#{license_id}/license_usages"

      expect(response).to have_http_status(:ok)
      license_usage = JSON.parse(response.body)
      usage_response = license_usage['data'].find { |c| c['id'] == usage.id.to_s }

      expect(usage_response).to have_attribute(:status).with_value('active')
      expect(usage_response).to have_relationship(:status_updated_by).with_data(
        { 'id' => usage.status_updated_by_id.to_s, 'type' => 'users' }
      )
    end
  end

  describe 'POST /api/v2/administration/clients/:client_id/licenses/:license_id/' \
           'license_usages/:license_usage_id/toggle_status' do
    it 'toggles license usage status' do
      post "/api/v2/administration/clients/#{client_id}/licenses/#{license_id}/" \
           "license_usages/#{license_usage_id}/toggle_status",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      usage_response = JSON.parse(response.body)['data']

      expect(usage_response).to have_attribute(:status).with_value('inactive')
    end
  end
end
