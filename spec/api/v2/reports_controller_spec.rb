# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ReportsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessment) { create(:hogan_assessment, external_settings: { assessment_id: 'HPI' }) }
  let!(:report) { create(:report, name: 'First Report') }
  let!(:deleted_report) { create(:report, name: 'First Report', deleted_at: Time.zone.now) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/reports/' do
    get 'Report List' do
      operationId 'ReportList'
      description <<~HEREDOC
        Fetch Report List

        **Supported Filter Query Parameter**

        | Filter        | Description   |
        | ------------- |:-------------:|
        | filter[name_cont]     | Returns report whose name matches the passed filter value |
      HEREDOC
      tags 'Report'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Report list' do
        let!(:report) { create(:report, :hogan, assessments: [assessment]) }

        schema '$ref' => '#/components/schemas/ReportListResponse'

        examples 'application/json' => [{
          type: 'reports',
          data: {
            id: '770',
            attributes: {
              name: 'Report Name'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          report_response = data.find { |d| d['id'] == report.id.to_s }
          expect(report_response).to have_key('id')
          expect(report_response).to have_attribute(:name).with_value(report.name)
          expect(report_response).to have_attribute(:hogan_report_packages).with_value(
            [{ 'id' => 'RPtFlashLeadSummary', 'name' => 'LEAD Series + Summary + Flash' }]
          )
        end
      end
    end

    post 'Create a report' do
      operationId 'CreateReport'
      description <<~HEREDOC
        Create a Report

            **Supported fields for external reports **

            | Name        | Description   | Applicable for |
            | ------------- |:-------------:|:-------------:|
            | external_settings[report_id]     | External report ID | Hogan, Saville |
      HEREDOC
      description 'Create new Report'
      tags 'Reports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportCreateRequest' },
                required: true

      response '201', 'Report Created' do
        schema '$ref' => '#/components/schemas/ReportResponse'
        examples 'application/json' => {
          data: {
            type: 'reports',
            attributes: {
              name: 'name',
              disabled: false,
              provider: 'hogan',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35',
              created_by: 'ROHAN PUJARI',
              description: 'asd',
              default_language: 'en',
              external_settings: {
                report_id: 'EcHPIDML'
              },
              icon_color: 'color'
            },
            relationships: {
              assessments: { data: [{ type: 'assessments', id: '39' }] },
              owner: { data: { type: 'clients', id: '266' } }
            }
          }
        }

        let(:client) { create(:tenancy) }
        let(:body) do
          {
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
        end

        run_test! do |response|
          report_response = JSON.parse(response.body)['data']
          expect(report_response).to have_key('id')
          expect(report_response).to have_attribute(:name).with_value('name')
        end
      end
    end
  end

  path '/reports/{report_id}' do
    patch 'Update a report' do
      operationId 'UpdateReport'
      description 'Update a Report'
      tags 'Reports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportUpdateRequest' },
                required: true

      response '200', 'Report Updated' do
        schema '$ref' => '#/components/schemas/ReportResponse'
        examples 'application/json' => {
          data: {
            type: 'reports',
            attributes: {
              name: 'name',
              disabled: false,
              icon_url: '#111',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35',
              created_by: 'ROHAN PUJARI',
              icon_color: '#000',
              description: 'asd',
              external_settings: {}
            },
            relationships: {
              owner: { data: { type: 'clients', id: '266' } }
            }
          }
        }

        let(:report_id) { report.id }

        let(:body) do
          {
            data: {
              type: 'reports',
              id: report.id.to_s,
              attributes: {
                name: 'new name',
                icon_color: '#111'
              }
            }
          }
        end

        run_test! do |response|
          report_response = JSON.parse(response.body)['data']
          expect(report_response).to have_key('id')
          expect(report_response).to have_attribute(:name).with_value('new name')
          expect(report_response).to have_attribute(:icon_color).with_value('#111')
        end
      end
    end

    delete 'Delete a report' do
      operationId 'DeleteReport'
      description 'Delete a Report'
      tags 'Reports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_id, in: :path, type: :string

      let(:report_id) { report.id }

      response '204', 'Report Deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(Report.find_by(id: report_id).deleted?).to eq(true)
        end
      end
    end
  end

  path '/reports/{report_id}/copy' do
    post 'Copy report' do
      operationId 'CopyReport'
      description 'Copy a Report'
      tags 'Reports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_id, in: :path, type: :string

      let(:report_id) { report.id }

      response '200', 'Report Coppied' do
        run_test! do |response|
          report_response = JSON.parse(response.body)['data']
          expect(report_response).to have_key('id')
          expect(report_response).to have_attribute(:name).with_value('First Report (1)')
        end
      end
    end
  end

  path '/reports/{report_id}/restore' do
    post 'Restore report' do
      operationId 'RestoreReport'
      description 'Restore a Report'
      tags 'Reports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_id, in: :path, type: :string

      let(:report_id) { deleted_report.id }

      response '200', 'Report Restored' do
        run_test! do |response|
          report_response = JSON.parse(response.body)['data']
          expect(report_response).to have_attribute(:deleted).with_value(false)
        end
      end
    end
  end
end
