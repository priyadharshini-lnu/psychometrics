# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DashboardsController, type: :request do
  let!(:project) { create(:project) }
  let!(:design_setting) { project.design_setting }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/design_settings' do
    it 'returns design settings' do
      get '/api/v2/administration/design_settings',
          params: { 'filter[project_id_eq]' => project.id },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data'].first
      expect(data).to have_key('id')
      expect(data).to have_attribute(:logo_alt_text).with_value(project.name)
      expect(data).to have_attribute(:secondary_logo_alt_text).with_value(project.name)
      expect(data).to have_attribute(:logo).with_value(nil)
      expect(data).to have_relationship(:project).
        with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
    end
  end

  describe 'PATCH /api/v2/design_settings/:id' do
    context 'with valid parameters' do
      it 'updates design settings' do
        body = jsonapi_resource_request(
          'design_settings',
          { id: design_setting.id.to_s, background_color: '#f00', login_box_position: 'left' },
          { project: { id: project.id.to_s, type: 'projects' } }
        )

        patch "/api/v2/administration/design_settings/#{design_setting.id}",
              params: body.to_json,
              headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        data = JSON.parse(response.body)['data']
        expect(data).to have_key('id')
        expect(data).to have_attribute(:background_color).with_value('#f00')
        expect(data).to have_attribute(:login_box_position).with_value('left')
        expect(data).to have_relationship(:project).
          with_data({ 'id' => project.id.to_s, 'type' => 'projects' })
      end
    end

    context 'with invalid parameters' do
      it 'returns validation errors' do
        body = jsonapi_resource_request(
          'design_settings',
          {
            id: design_setting.id.to_s,
            logo_alt_text: 'Proj@2024',
            secondary_logo_alt_text: 'a' * 300
          }
        )

        patch "/api/v2/administration/design_settings/#{design_setting.id}",
              params: body.to_json,
              headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:unprocessable_entity)
        errors = JSON.parse(response.body)['errors']
        expect(errors).to include(
          hash_including(
            'title' => 'is in invalid format',
            'source' => { 'pointer' => '/data/attributes/logo_alt_text' }
          ),
          hash_including(
            'title' => 'size cannot be greater than 100',
            'source' => { 'pointer' => '/data/attributes/secondary_logo_alt_text' }
          )
        )
      end
    end
  end
end
