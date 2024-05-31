# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ReportFamiliesReportsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:report_family) { create(:report_family, name: 'bundle name') }
  let(:report_families_report) { create(:report_families_report, report_family:, report: create(:report)) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/report_families/{report_family_id}/report_families_reports/' do
    before do
      report_families_report.update(external_package_id: 'RPInsightFlashPkg')
    end

    get 'Report Family Report List' do
      operationId 'ReportFamilyReportList'
      tags 'ReportFamiliesReports'
      consumes 'application/json'
      security [basic: []]
      parameter name: :report_family_id, in: :path, type: :string

      response '200', 'Report family report list' do
        let(:report_family_id) { report_family.id }
        schema '$ref' => '#/components/schemas/ReportFamiliesReportListResponse'

        examples 'application/json' => [{
          type: 'report_families_reports',
          data: {
            id: '770',
            attributes: {
              name: 'Name'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          parsed_response = data.find { |d| d['id'] == report_families_report.id.to_s }
          expect(parsed_response).to have_key('id')
          expect(parsed_response).to have_attribute(:bundle_name).with_value('bundle name')
          expect(parsed_response).to have_attribute(:external_package_id).with_value('RPInsightFlashPkg')
        end
      end
    end

    post 'Create a report families report' do
      operationId 'CreateReportFamiliesReport'
      description <<~HEREDOC
        Create a Report Families Report
      HEREDOC
      description 'Create new Report Families Report'
      tags 'ReportFamilesReports'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :report_family_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportFamiliesReportCreateRequest' },
                required: true

      response '201', 'Report Families ReportCreated' do
        schema '$ref' => '#/components/schemas/ReportFamiliesReportResponse'
        examples 'application/json' => {
          data: {
            type: 'report_families_reports',
            attributes: {
              name: 'name',
              bundle_name: 'bundle name',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35'
            }
          }
        }

        let(:report_family_id) { report_family.id }
        let(:report) { create(:report) }

        let(:body) do
          {
            data: {
              type: 'report_families_reports',
              attributes: {
                report_id: report.id.to_s,
                external_package_id: 'RPInsightFlashPkg'
              }
            }
          }
        end

        run_test! do |response|
          parsed_response = JSON.parse(response.body)['data']
          expect(parsed_response).to have_key('id')
          expect(parsed_response).to have_attribute(:bundle_name).with_value('bundle name')

          report_families_report = report.report_families_reports.last
          expect(report_families_report.external_package_id).to eq('RPInsightFlashPkg')
        end
      end
    end
  end

  path '/report_families/{report_family_id}/report_families_reports/{report_families_report_id}' do
    delete 'Delete a report families report' do
      operationId 'DeleteReportFamiliesReport'
      description 'Delete a Report Families Report'
      tags 'ReportFamiliesReports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_family_id, in: :path, type: :string
      parameter name: :report_families_report_id, in: :path, type: :string

      let(:report_families_report_id) { report_families_report.id }
      let(:report_family_id) { report_family.id }

      response '204', 'Report Families Report Deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(ReportFamiliesReport.find_by(id: report_families_report_id)).to eq(nil)
        end
      end
    end
  end
end
