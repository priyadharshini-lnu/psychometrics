# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Clients::ReportsController, swagger_doc: 'v2/swagger.json', type: :request do
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

  path '/clients/{client_id}/reports' do
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

    get 'Reports list part of the common license' do
      operationId 'IdpTemplateAvailableReports'
      tags 'IdpTemplateAvailableReports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', 'Idp Template available reports from multiple families' do
        run_test! do |response|
          expected_reports = client.licenses.map { |l| l.report_family.reports.map(&:name) }.flatten
          reports = JSON.parse(response.body)['data']
          expect(reports.size).to eq(expected_reports.size)
          expect(reports.map { |r| r['attributes']['name'] }).to include(*expected_reports)
        end
      end
    end

    get 'Reports list part of the common license filtered by report name' do
      operationId 'IdpTemplateAvailableReports'
      tags 'IdpTemplateAvailableReports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :'filter[name_cont]', in: :query, type: :string

      response '200', 'Idp Template available reports filtered by name' do
        query = 'example'
        let(:'filter[name_cont]') { query }

        run_test! do |response|
          expected_reports = ['Example Report', 'Example Report2']
          reports = JSON.parse(response.body)['data']
          expect(reports.size).to eq(expected_reports.size)
          expect(reports.map { |r| r['attributes']['name'] }).to include(*expected_reports)
        end
      end
    end
  end
end
