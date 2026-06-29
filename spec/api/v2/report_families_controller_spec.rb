# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ReportFamiliesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:report_family) { create(:report_family, name: 'Report Family') }
  before { sign_in(superadmin) }

  describe 'GET /report_families/' do
    it 'Report Family List' do
      get '/api/v2/administration/report_families/',
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      parsed_response = data.find { |d| d['id'] == report_family.id.to_s }
      expect(parsed_response).to have_key('id')
      expect(parsed_response).to have_attribute(:name).with_value('Report Family')
    end
  end

  describe 'POST /report_families/' do
    it 'Create a report family' do
      body = {
        data: {
          type: 'report_families',
          attributes: {
            name: 'name'
          }
        }
      }

      post '/api/v2/administration/report_families/',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      parsed_response = JSON.parse(response.body)['data']
      expect(parsed_response).to have_key('id')
      expect(parsed_response).to have_attribute(:name).with_value('name')
    end
  end

  describe 'PATCH /report_families/{report_family_id}' do
    it 'Update a report family' do
      body = {
        data: {
          type: 'report_families',
          id: report_family.id.to_s,
          attributes: {
            name: 'new name'
          }
        }
      }

      patch "/api/v2/administration/report_families/#{report_family.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      parsed_response = JSON.parse(response.body)['data']
      expect(parsed_response).to have_key('id')
      expect(parsed_response).to have_attribute(:name).with_value('new name')
    end
  end

  describe 'DELETE /report_families/{report_family_id}' do
    it 'Delete a report family' do
      delete "/api/v2/administration/report_families/#{report_family.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(ReportFamily.find_by(id: report_family.id)).to eq(nil)
    end
  end
end
