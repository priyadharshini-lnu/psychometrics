# frozen_string_literal: true

require 'rails_helper'

require_relative 'concerns/taggable_api_endpoints_shared_examples'

RSpec.describe Api::V2::Administration::ReportsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessment) { create(:hogan_assessment, external_settings: { assessment_id: 'HPI' }) }
  let!(:report) { create(:report, name: 'First Report') }
  let!(:deleted_report) { create(:report, name: 'First Report', deleted_at: Time.zone.now) }
  before { sign_in(superadmin) }

  describe 'GET /reports/' do
    it 'Report List' do
      hogan_report = create(:report, :hogan, assessments: [assessment])

      get '/api/v2/administration/reports/',
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      report_response = data.find { |d| d['id'] == hogan_report.id.to_s }
      expect(report_response).to have_key('id')
      expect(report_response).to have_attribute(:name).with_value(hogan_report.name)
      expect(report_response).to have_attribute(:external_report).with_value(true)
      expect(report_response).to have_attribute(:hogan_report_packages).with_value(
        [{ 'id' => 'RPtFlashLeadSummary', 'name' => 'LEAD Series + Summary + Flash' }]
      )
    end
  end

  describe 'POST /reports/' do
    it 'Create a report' do
      client = create(:tenancy)
      body = {
        data: {
          type: 'reports',
          attributes: {
            description: 'name',
            name: 'name',
            provider: 'hogan',
            icon_color: 'color',
            external_settings: {
              report_id: 'EcHPIDML'
            }
          },
          relationships: {
            assessments: { data: [{ type: 'assessments', id: assessment.id.to_s }] },
            owner: { data: { type: 'clients', id: client.id.to_s } }
          }
        }
      }

      post '/api/v2/administration/reports/',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      report_response = JSON.parse(response.body)['data']
      expect(report_response).to have_key('id')
      expect(report_response).to have_attribute(:name).with_value('name')
    end

    it 'returns owner incompatibility error when report owner and assessment owner differ' do
      assessment_owner = create(:tenancy)
      report_owner = create(:tenancy)
      owner_scoped_assessment = create(:assessment, owner: assessment_owner, project: assessment_owner)
      body = {
        data: {
          type: 'reports',
          attributes: {
            description: 'name',
            name: 'name',
            provider: 'internal',
            icon_color: 'color'
          },
          relationships: {
            assessments: { data: [{ type: 'assessments', id: owner_scoped_assessment.id.to_s }] },
            owner: { data: { type: 'clients', id: report_owner.id.to_s } }
          }
        }
      }

      post '/api/v2/administration/reports/',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      error_titles = errors.pluck('title')
      expect(errors.size).to eq(1)
      expect(error_titles).to include('assessment owner is not compatible with report owner.')
      expect(error_titles).not_to include('is invalid')
    end
  end

  describe 'PATCH /reports/{report_id}' do
    it 'Update a report' do
      body = {
        data: {
          type: 'reports',
          id: report.id.to_s,
          attributes: {
            name: 'new name',
            icon_color: '#111'
          }
        }
      }

      patch "/api/v2/administration/reports/#{report.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      report_response = JSON.parse(response.body)['data']
      expect(report_response).to have_key('id')
      expect(report_response).to have_attribute(:name).with_value('new name')
      expect(report_response).to have_attribute(:icon_color).with_value('#111')
    end

    it 'returns owner incompatibility error when updating owner with owner-scoped assessment attached' do
      assessment_owner = create(:tenancy)
      updated_owner = create(:tenancy)
      owner_scoped_assessment = create(:assessment, owner: assessment_owner, project: assessment_owner)
      scoped_report = create(
        :report,
        owner: assessment_owner,
        assessments: [owner_scoped_assessment],
        report_families: []
      )
      body = {
        data: {
          type: 'reports',
          id: scoped_report.id.to_s,
          attributes: {
            provider: scoped_report.provider
          },
          relationships: {
            owner: { data: { type: 'clients', id: updated_owner.id.to_s } }
          }
        }
      }

      patch "/api/v2/administration/reports/#{scoped_report.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      error_titles = errors.pluck('title')
      expect(errors.size).to eq(1)
      expect(error_titles).to include('assessment owner is not compatible with report owner.')
      expect(error_titles).not_to include('is invalid')
    end
  end

  describe 'DELETE /reports/{report_id}' do
    it 'Delete a report' do
      delete "/api/v2/administration/reports/#{report.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(Report.find_by(id: report.id).deleted?).to eq(true)
    end
  end

  describe 'POST /reports/{report_id}/copy' do
    it 'Copy report' do
      client = create(:tenancy)
      body = {
        data: {
          type: 'reports',
          id: report.id.to_s,
          attributes: {
            name: 'Copy of First Report'
          },
          relationships: {
            owner: { data: { type: 'clients', id: client.id } }
          }
        }
      }

      expect do
        post "/api/v2/administration/reports/#{report.id}/copy",
             params: body.to_json,
             headers: { 'Content-Type' => 'application/vnd.api+json' }
      end.to change(AdminJobRecord, :count).by(1)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')

      job = AdminJobRecord.order(:created_at).last
      expect(job.operation).to eq('copy_report')
      expect(job.data['report_id']).to eq(report.id)
      expect(job.data['owner_id']).to eq(client.id)
      expect(job.data['name']).to eq('Copy of First Report')
    end
  end

  describe 'POST /reports/{report_id}/restore' do
    it 'Restore report' do
      post "/api/v2/administration/reports/#{deleted_report.id}/restore",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      report_response = JSON.parse(response.body)['data']
      expect(report_response).to have_attribute(:deleted).with_value(false)
    end
  end

  describe 'taggable API endpoints' do
    include_examples 'taggable API endpoints', Report
  end
end
