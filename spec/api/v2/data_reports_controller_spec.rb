# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::DataReportsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:data_report) { create(:data_report, owner: project.client) }
  let(:data_report_id) { data_report.id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  describe 'as superadmin' do
    before do
      sign_in(superadmin)
      Current.user = superadmin
      data_report
    end

    path '/data_reports' do
      get 'DataReports List' do
        operationId 'DataReports'
        description 'Fetch data reports list'
        tags 'DataReport'
        consumes 'application/json'
        security [basic: []]
        parameter name: :include, in: :query, type: :string

        response '200', 'Data Report list' do
          schema '$ref' => '#/components/schemas/DataReportMultipleResponse'

          let(:include) { 'owner,last_updated_by' }

          run_test! do |response|
            dr = JSON.parse(response.body)['data'].first

            expect(dr).to have_attribute(:name).with_value(data_report.name)
          end
        end
      end

      post 'DataReports create' do
        operationId 'DataReports'
        description 'Create data report'
        tags 'DataReport'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/DataReportCreateRequest' },
                  required: true

        response '201', 'Data Report create' do
          schema '$ref' => '#/components/schemas/DataReportSingleResponse'

          examples 'application/json' => {
            data: {
              type: 'data_reports',
              attributes: {
                name: 'DataReport',
                configuration: '{}'
              },
              relationships: {
                owner: { data: { type: 'clients', id: 1 } }
              }
            }
          }

          let(:body) do
            {
              data: {
                type: 'data_reports',
                attributes: {
                  name: 'DataReport',
                  configuration: {
                    project_ids: [campaign.project.id],
                    sections: [{
                      name: 'Section 1',
                      cell_format: {
                        font_size: 12
                      },
                      columns: [{
                        name: 'Column 1',
                        type: 'user_detail',
                        field_name: 'email'
                      }]
                    }]
                  }.to_json
                },
                relationships: {
                  owner: { data: { type: 'clients', id: project.client.id.to_s } }
                }
              }
            }
          end

          run_test! do |response|
            dr = JSON.parse(response.body)['data']

            expect(dr).to have_attribute(:name).with_value('DataReport')
            expect(dr).to have_relationship(:last_updated_by).with_data({ 'id' => superadmin.id.to_s,
                                                                          'type' => 'users' })
          end
        end
      end
    end

    path '/data_reports/{data_report_id}' do
      patch 'DataReports update' do
        operationId 'DataReports'
        description 'Update data report'
        tags 'DataReport'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :data_report_id, in: :path, type: :string
        parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/DataReportUpdateRequest' },
                  required: true

        response '200', 'Data Report update' do
          schema '$ref' => '#/components/schemas/DataReportSingleResponse'

          examples 'application/json' => {
            data: {
              id: '1',
              type: 'data_reports',
              attributes: {
                name: 'DataReport',
                configuration: '{}'
              },
              relationships: {
                owner: { data: { type: 'clients', id: 1 } }
              }
            }
          }

          let(:body) do
            {
              data: {
                id: data_report_id.to_s,
                type: 'data_reports',
                attributes: {
                  name: 'changed name',
                  configuration: {
                    project_ids: [campaign.project.id],
                    sections: [{
                      name: 'Section 1',
                      cell_format: {
                        font_size: 12
                      },
                      columns: [{
                        name: 'Column 1',
                        type: 'user_detail',
                        field_name: 'first_name'
                      }]
                    }]
                  }.to_json
                },
                relationships: {
                  owner: { data: { type: 'clients', id: campaign.client.id.to_s } }
                }
              }
            }
          end

          run_test! do |response|
            dr = JSON.parse(response.body)['data']

            expect(dr).to have_attribute(:name).with_value('changed name')
            expect(dr).to have_relationship(:last_updated_by).with_data({ 'id' => superadmin.id.to_s,
                                                                          'type' => 'users' })
          end
        end
      end
    end

    path '/data_reports/{data_report_id}/run' do
      post 'DataReports run report job' do
        operationId 'DataReports'
        description 'Run report job'
        tags 'DataReport'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :data_report_id, in: :path, type: :string

        response '200', 'DataReport run job' do
          schema '$ref' => '#/components/schemas/OKResponse'

          run_test! do |_response|
            job = data_report.data_report_jobs.first

            expect(job).to be_present
            expect(AdminJobRecord.last).to eq(job.admin_job_record)
          end
        end
      end
    end
  end

  describe 'as client admin' do
    let!(:project2) { create(:project) }
    let!(:client_admin_membership) do
      create(:client_admin_membership,
             grants: create(:membership_grants, data: { clients: %w[export_data_report] }),
             client: project2.client)
    end

    let!(:client_admin) { create(:client_admin, memberships: [client_admin_membership]) }
    let(:client_data_report) { create(:data_report, owner: project2.client) }

    before do
      sign_in(client_admin)
      Current.user = client_admin
      create(:data_report, owner: project.client)
      client_data_report
    end

    path '/data_reports' do
      get 'DataReports List' do
        operationId 'DataReports'
        description 'Fetch data reports list'
        tags 'DataReport'
        consumes 'application/json'
        security [basic: []]
        parameter name: :include, in: :query, type: :string
        parameter name: :'filter[owner_id_eq]', in: :query, type: :string

        response '200', 'Client Data Report list' do
          schema '$ref' => '#/components/schemas/DataReportMultipleResponse'

          let(:include) { 'owner,last_updated_by' }
          let(:'filter[owner_id_eq]') { project2.client.id }

          run_test! do |response|
            dr = JSON.parse(response.body)['data']

            expect(DataReport.count).to eq(2)
            expect(dr.size).to eq(1)

            expect(dr.first).to have_attribute(:name).with_value(client_data_report.name)
          end
        end
      end
    end

    path '/data_reports/{client_data_report_id}/run' do
      post 'DataReports run report job' do
        operationId 'DataReports'
        description 'Run report job'
        tags 'DataReport'
        consumes 'application/vnd.api+json'
        security [basic: []]
        parameter name: :client_data_report_id, in: :path, type: :string

        response '200', 'DataReport run job' do
          schema '$ref' => '#/components/schemas/OKResponse'
          let(:client_data_report_id) { client_data_report.id }

          run_test! do |_response|
            job = client_data_report.data_report_jobs.first

            expect(job).to be_present
            expect(AdminJobRecord.last).to eq(job.admin_job_record)
          end
        end
      end
    end
  end
end
