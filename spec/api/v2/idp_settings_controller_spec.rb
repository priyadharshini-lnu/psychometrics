# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::IdpSettingsController, type: :request do
  let!(:project) { create(:project) }
  let!(:idp_setting) { project.idp_setting }
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin, client: project.client) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/idp_settings' do
    it 'gets idp settings' do
      get '/api/v2/administration/idp_settings',
          params: { 'filter[project_id_eq]' => project.id },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data'].first
      expect(data).to have_key('id')
      expect(data).to have_attribute(:manager_approves_idp).with_value(false)
      expect(data).to have_attribute(:manager_can_edit_idp).with_value(false)
      expect(data).to have_relationship(:project).
        with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
    end
  end

  describe 'PATCH /api/v2/administration/idp_settings/:setting_id' do
    it 'updates idp settings' do
      body = jsonapi_resource_request(
        'idp_settings',
        {
          id: idp_setting.id.to_s,
          manager_approves_idp: true,
          manager_can_edit_idp: true
        },
        { project: { id: project.id.to_s, type: 'projects' } }
      )

      patch "/api/v2/administration/idp_settings/#{idp_setting.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:manager_approves_idp).with_value(true)
      expect(data).to have_attribute(:manager_can_edit_idp).with_value(true)
      expect(data).to have_relationship(:project).
        with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
    end
  end
end
