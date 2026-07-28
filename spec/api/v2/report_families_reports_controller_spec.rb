# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ReportFamiliesReportsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:report_family) { create(:report_family, name: 'bundle name') }
  let(:report_families_report) { create(:report_families_report, report_family:, report: create(:report)) }
  before { sign_in(superadmin) }

  describe 'GET /report_families/:report_family_id/report_families_reports' do
    before do
      report_families_report.update(external_package_id: 'RPInsightFlashPkg')
    end

    it 'fetches report family report list' do
      get "/api/v2/administration/report_families/#{report_family.id}/report_families_reports/",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      parsed_response = data.find { |d| d['id'] == report_families_report.id.to_s }
      expect(parsed_response).to have_key('id')
      expect(parsed_response).to have_attribute(:bundle_name).with_value('bundle name')
      expect(parsed_response).to have_attribute(:external_package_id).with_value('RPInsightFlashPkg')
    end
  end

  describe 'POST /report_families/:report_family_id/report_families_reports' do
    it 'creates a report families report' do
      report = create(:report)
      body = {
        data: {
          type: 'report_families_reports',
          attributes: {
            external_package_id: 'RPInsightFlashPkg'
          },
          relationships: {
            report: {
              data: {
                type: 'reports',
                id: report.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/report_families/#{report_family.id}/report_families_reports",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      parsed_response = JSON.parse(response.body)['data']
      expect(parsed_response).to have_key('id')
      expect(parsed_response).to have_attribute(:bundle_name).with_value('bundle name')

      report_families_report = report.report_families_reports.last
      expect(report_families_report.external_package_id).to eq('RPInsightFlashPkg')
    end

    it 'returns error when report owner is not compatible with report bundle owner' do
      report_family_owner = create(:tenancy)
      report_owner = create(:tenancy)
      report_family = create(:report_family, tenant_id: report_family_owner.id)
      report = create(:report, owner: report_owner, report_families: [])

      body = {
        data: {
          type: 'report_families_reports',
          attributes: {
            external_package_id: 'RPInsightFlashPkg'
          },
          relationships: {
            report: {
              data: {
                type: 'reports',
                id: report.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/report_families/#{report_family.id}/report_families_reports",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      expect(errors.first['title']).to eq('report owner is not compatible with report bundle owner.')
    end

    it 'returns error for duplicate report families report' do
      existing_report = create(:report)
      create(:report_families_report, report_family_id: report_family.id, report: existing_report)

      body = {
        data: {
          type: 'report_families_reports',
          attributes: {
            external_package_id: 'RPInsightFlashPkg'
          },
          relationships: {
            report_family: {
              data: {
                type: 'report_families',
                id: report_family.id.to_s
              }
            },
            report: {
              data: {
                type: 'reports',
                id: existing_report.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/report_families/#{report_family.id}/report_families_reports/",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      expect(errors.first['title']).to eq('This Report is already a part of Report Bundle')
    end
  end

  describe 'DELETE /report_families/:report_family_id/report_families_reports/:id' do
    it 'deletes a report families report' do
      delete "/api/v2/administration/report_families/#{report_family.id}/" \
             "report_families_reports/#{report_families_report.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(ReportFamiliesReport.find_by(id: report_families_report.id)).to eq(nil)
    end
  end
end
