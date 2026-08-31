# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::LicensesController, type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:license) { create(:license, client: client) }
  let(:client_id) { client.id.to_s }
  let(:license_id) { license.id.to_s }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/clients/:client_id/licenses' do
    it 'fetches client Licenses list' do
      get "/api/v2/administration/clients/#{client_id}/licenses",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      licenses = JSON.parse(response.body)
      license_response = licenses['data'].find { |c| c['id'] == license_id }

      expect(license_response).to have_attribute(:number).with_value(license.number)
      expect(license_response).to have_attribute(:overuse_number).with_value(license.overuse_number)
      expect(license_response).to have_relationship(:client).with_data({ 'id' => client_id, 'type' => 'clients' })
      expect(license_response).to have_relationship(:report_family).
        with_data({ 'id' => license.report_family_id.to_s, 'type' => 'report_families' })
    end

    it 'returns UAT users count for client license page' do
      create(:user, project: create(:project, parent: client), is_uat: true)
      create(:user, project: create(:project, parent: client), is_uat: true)
      create(:user, project: create(:project, parent: client), is_uat: false)

      get "/api/v2/administration/clients/#{client_id}/licenses",
          params: { include_meta: 'uat_users_count' },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig('meta', 'uat_users_count')).to eq(2)
    end
  end

  describe 'POST /api/v2/administration/clients/:client_id/licenses' do
    it 'creates License' do
      body = {
        data: {
          type: 'licenses',
          attributes: {
            number: 100,
            overuse_number: 0,
            used_number: 1,
            start_date: '2017-05-01',
            end_date: '2021-01-01',
            report_family_id: 2,
            disabled: false,
            type: 'common'
          },
          relationships: {
            report_family: {
              data: {
                type: 'report_families',
                id: license.report_family_id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/clients/#{client_id}/licenses",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      license_response = JSON.parse(response.body)['data']

      expect(license_response).to have_key('id')
      expect(license_response).to have_attribute(:number).with_value(100)
      expect(license_response).to have_attribute(:overuse_number).with_value(0)
      expect(license_response).to have_attribute(:client_id).with_value(client.id)
      expect(license_response).to have_relationship(:client).with_data({ 'id' => client_id, 'type' => 'clients' })
      expect(license_response).to have_relationship(:report_family).
        with_data({ 'id' => license.report_family_id.to_s, 'type' => 'report_families' })
    end
  end

  describe 'PATCH /api/v2/administration/clients/:client_id/licenses/:license_id' do
    it 'updates License' do
      body = {
        data: {
          type: 'licenses',
          id: license_id,
          attributes: {
            number: 101,
            overuse_number: 1,
            start_date: '2017-05-01',
            end_date: '2025-01-01',
            type: 'common'
          },
          relationships: {
            report_family: {
              data: {
                type: 'report_families',
                id: license.report_family_id.to_s
              }
            }
          }
        }
      }

      patch "/api/v2/administration/clients/#{client_id}/licenses/#{license_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      license_response = JSON.parse(response.body)['data']

      expect(license_response).to have_attribute(:number).with_value(101)
      expect(license_response).to have_attribute(:overuse_number).with_value(1)
      expect(license_response).to have_relationship(:client).with_data({ 'id' => client_id, 'type' => 'clients' })
      expect(license_response).to have_relationship(:report_family).
        with_data({ 'id' => license.report_family_id.to_s, 'type' => 'report_families' })
    end
  end
end
