# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ExternalReportsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:hogan_assessment) { create(:hogan_assessment, external_settings: { assessment_id: 'HPI' }) }
  let!(:saville_assessment) do
    create(:assessment, :saville, external_settings: { assessment_id: 'a830e4ab-bc66-4238-92e0-6e6fd3fd1edf' })
  end
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/external_reports/' do
    it 'returns external report list for Hogan' do
      get '/api/v2/administration/external_reports/',
          params: { 'filter[type_eq]' => 'hogan', 'filter[assessment_ids_in]' => hogan_assessment.id }

      expect(response).to have_http_status(200)
      parsed_response = JSON.parse(response.body)['data']
      expect(parsed_response.length).to eq(3)
      expect(parsed_response.first).to have_key('id')
      expect(parsed_response.first).to have_attribute(:name).with_value('HPI Data Report')
    end

    it 'returns external report list for Saville' do
      get '/api/v2/administration/external_reports/',
          params: { 'filter[type_eq]' => 'saville', 'filter[assessment_ids_in]' => saville_assessment.id }

      expect(response).to have_http_status(200)
      parsed_response = JSON.parse(response.body)['data']
      expect(parsed_response.length).to eq(16)
      expect(parsed_response.first).to have_key('id')
      expect(parsed_response.first).to have_attribute(:name).
        with_value('Wave Focus Styles Building Resilient Agility Report V4')
    end
  end
end
