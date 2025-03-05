# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ReportFamiliesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:report_family) { create(:report_family, name: 'Report Family') }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/report_families/' do
    get 'Report Family List' do
      operationId 'ReportFamilyList'
      tags 'ReportFamilies'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Report family list' do
        schema '$ref' => '#/components/schemas/ReportFamilyListResponse'

        examples 'application/json' => [{
          type: 'report_families',
          data: {
            id: '770',
            attributes: {
              name: 'Name',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35'
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          parsed_response = data.find { |d| d['id'] == report_family.id.to_s }
          expect(parsed_response).to have_key('id')
          expect(parsed_response).to have_attribute(:name).with_value('Report Family')
        end
      end
    end

    post 'Create a report family' do
      operationId 'CreateReportFamily'
      description <<~HEREDOC
        Create a Report Family
      HEREDOC
      description 'Create new Report Family'
      tags 'Reports'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportFamilyCreateRequest' },
                required: true

      response '201', 'Report Family Created' do
        schema '$ref' => '#/components/schemas/ReportFamilyResponse'
        examples 'application/json' => {
          data: {
            type: 'report_families',
            attributes: {
              name: 'name',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35'
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'report_families',
              attributes: {
                name: 'name'
              }
            }
          }
        end

        run_test! do |response|
          parsed_response = JSON.parse(response.body)['data']
          expect(parsed_response).to have_key('id')
          expect(parsed_response).to have_attribute(:name).with_value('name')
        end
      end
    end
  end

  path '/report_families/{report_family_id}' do
    patch 'Update a report family' do
      operationId 'UpdateReportFamily'
      description 'Update a Report Family'
      tags 'ReportFamilies'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_family_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportUpdateRequest' },
                required: true

      response '200', 'Report Family Updated' do
        schema '$ref' => '#/components/schemas/ReportFamilyResponse'
        examples 'application/json' => {
          data: {
            type: 'reports',
            attributes: {
              name: 'new name'
            }
          }
        }

        let(:report_family_id) { report_family.id }

        let(:body) do
          {
            data: {
              type: 'report_families',
              id: report_family.id.to_s,
              attributes: {
                name: 'new name'
              }
            }
          }
        end

        run_test! do |response|
          parsed_response = JSON.parse(response.body)['data']
          expect(parsed_response).to have_key('id')
          expect(parsed_response).to have_attribute(:name).with_value('new name')
        end
      end
    end

    delete 'Delete a report family' do
      operationId 'DeleteReportFamily'
      description 'Delete a Report Family'
      tags 'ReportFamilies'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_family_id, in: :path, type: :string

      let(:report_family_id) { report_family.id }

      response '204', 'Report Family Deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(ReportFamily.find_by(id: report_family_id)).to eq(nil)
        end
      end
    end
  end
end
