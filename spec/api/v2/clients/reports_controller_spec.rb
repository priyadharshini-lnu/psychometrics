# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::Clients::ReportsController, type: :request do
  let!(:client) { create(:tenancy) }
  let(:client_id) { client.id }
  let!(:report) { create(:report) }
  let!(:superadmin) { create(:superadmin) }
  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  describe 'GET /api/v2/administration/clients/:client_id/reports' do
    let!(:license_report1) { create(:report, name: 'Example Report') }
    let!(:license_report2) { create(:report, name: 'Example Report2') }
    let!(:report) { create(:report, name: 'Example Report3') }

    let!(:report_family) { create(:report_family, reports: [license_report1, license_report2]) }
    let!(:license) { create(:license, type: :common, client: client, report_family: report_family) }
    let!(:additional_report) { create(:report, name: 'Additional Report') }
    let!(:additional_report_family) { create(:report_family, reports: [additional_report]) }
    let!(:additional_license) do
      create(:license, type: :common, client: client, report_family: additional_report_family)
    end

    it 'returns reports list part of the common license' do
      get "/api/v2/administration/clients/#{client_id}/reports",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expected_reports = client.licenses.map { |l| l.report_family.reports.map(&:name) }.flatten
      reports = JSON.parse(response.body)['data']
      expect(reports.size).to eq(expected_reports.size)
      expect(reports.map { |r| r['attributes']['name'] }).to include(*expected_reports)
    end

    it 'returns reports list filtered by report name' do
      query = 'example'

      get "/api/v2/administration/clients/#{client_id}/reports",
          params: { 'filter[name_cont]' => query },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expected_reports = ['Example Report', 'Example Report2']
      reports = JSON.parse(response.body)['data']
      expect(reports.size).to eq(expected_reports.size)
      expect(reports.map { |r| r['attributes']['name'] }).to include(*expected_reports)
    end
  end
end
