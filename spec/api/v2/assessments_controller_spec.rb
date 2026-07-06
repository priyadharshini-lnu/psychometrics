# frozen_string_literal: true

require 'rails_helper'
require_relative 'concerns/taggable_api_endpoints_shared_examples'

RSpec.describe Api::V2::Administration::AssessmentsController, type: :request do
  let!(:assessment) { create(:assessment, category: 'psychometric') }
  let!(:superadmin) { create(:superadmin) }

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/assessments' do
    it 'returns assessments list' do
      get '/api/v2/administration/assessments'

      expect(response).to have_http_status(:ok)
      assessments = JSON.parse(response.body)
      assessment_response = assessments['data'].find { |c| c['id'] == assessment.id.to_s }
      expect(assessment_response).to have_key('id')
      expect(assessment_response).to have_attribute(:name).with_value(assessment.name)
    end
  end

  describe 'POST /api/v2/administration/assessments' do
    it 'creates an assessment' do
      dimension = create(:dimension)
      client = create(:tenancy)
      body = {
        data: {
          type: 'assessments',
          attributes: {
            category: 'psychometric',
            description: 'name',
            name: 'name',
            type: 'common',
            extra: { icon_color: 'color' },
            tag_list: ['psychometric']
          },
          relationships: {
            dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
            owner: { data: { type: 'clients', id: client.id.to_s } }
          }
        }
      }

      post '/api/v2/administration/assessments', params: body.to_json,
                                                headers: {
                                                  'Content-Type' => 'application/vnd.api+json'
                                                }

      expect(response).to have_http_status(:created)
      assessment_response = JSON.parse(response.body)['data']
      expect(assessment_response).to have_key('id')
      expect(assessment_response).to have_attribute(:name).with_value('name')
      expect(assessment_response).to have_relationship(:dimension).
        with_data({ 'id' => dimension.id.to_s, 'type' => 'dimensions' })
      expect(assessment_response).to have_attribute(:tag_list).with_value(['psychometric'])
    end
  end

  describe 'PATCH /api/v2/administration/assessments/:assessment_id' do
    it 'updates an assessment' do
      body = {
        data: {
          type: 'assessments',
          id: assessment.id.to_s,
          attributes: {
            icon_color: '#111',
            enable_video_check: true,
            enable_audio_check: true,
            enable_network_check: true
          }
        }
      }

      patch "/api/v2/administration/assessments/#{assessment.id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      assessment_response = JSON.parse(response.body)['data']
      expect(assessment_response).to have_key('id')
      expect(assessment_response).to have_attribute(:icon_color).with_value('#111')
      expect(assessment_response).to have_attribute(:enable_video_check).with_value(true)
      expect(assessment_response).to have_attribute(:enable_audio_check).with_value(true)
      expect(assessment_response).to have_attribute(:enable_network_check).with_value(true)
    end

    it 'deletes an assessment' do
      delete "/api/v2/administration/assessments/#{assessment.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(Assessment.find_by(id: assessment.id).deleted?).to eq(true)
    end
  end

  describe 'POST /api/v2/administration/assessments/:assessment_id/copy' do
    it 'copies an assessment' do
      client = create(:tenancy)
      body = {
        data: {
          type: 'assessments',
          id: assessment.id.to_s,
          attributes: {
            name: 'Copy of First Assessment'
          },
          relationships: {
            owner: { data: { type: 'clients', id: client.id } }
          }
        }
      }

      expect do
        post "/api/v2/administration/assessments/#{assessment.id}/copy", params: body.to_json,
            headers: {
              'Content-Type' => 'application/vnd.api+json'
            }
      end.to change(AdminJobRecord, :count).by(1)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')

      job = AdminJobRecord.order(:created_at).last
      expect(job.operation).to eq('copy_assessment')
      expect(job.data['assessment_id']).to eq(assessment.id)
      expect(job.data['owner_id']).to eq(client.id)
      expect(job.data['name']).to eq('Copy of First Assessment')
    end
  end

  describe 'taggable API endpoints' do
    include_examples 'taggable API endpoints', Assessment
  end
end
