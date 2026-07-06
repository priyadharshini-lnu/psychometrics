# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DataReportsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:data_report) { create(:data_report, owner: project.client) }
  let(:data_report_id) { data_report.id }
  describe 'as superadmin' do
    before do
      sign_in(superadmin)
      Current.user = superadmin
      data_report
    end

    describe 'GET /api/v2/administration/data_reports' do
      it 'fetches data reports list' do
        get '/api/v2/administration/data_reports',
            params: { include: 'owner,last_updated_by' },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        dr = JSON.parse(response.body)['data'].first

        expect(dr).to have_attribute(:name).with_value(data_report.name)
      end
    end

    describe 'POST /api/v2/administration/data_reports' do
      it 'creates data report' do
        body = {
          data: {
            type: 'data_reports',
            attributes: {
              name: 'DataReport',
              report_type: 'json_data_report',
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

        post '/api/v2/administration/data_reports',
             params: body.to_json,
             headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:created)
        dr = JSON.parse(response.body)['data']

        expect(dr).to have_attribute(:name).with_value('DataReport')
        expect(dr).to have_relationship(:last_updated_by).with_data({ 'id' => superadmin.id.to_s,
                                                                      'type' => 'users' })
      end
    end

    describe 'PATCH /api/v2/administration/data_reports/:data_report_id' do
      it 'updates data report' do
        body = {
          data: {
            id: data_report_id.to_s,
            type: 'data_reports',
            attributes: {
              name: 'changed name',
              report_type: 'json_data_report',
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

        patch "/api/v2/administration/data_reports/#{data_report_id}",
              params: body.to_json,
              headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        dr = JSON.parse(response.body)['data']

        expect(dr).to have_attribute(:name).with_value('changed name')
        expect(dr).to have_relationship(:last_updated_by).with_data({ 'id' => superadmin.id.to_s,
                                                                      'type' => 'users' })
      end
    end

    describe 'POST /api/v2/administration/data_reports/:data_report_id/run' do
      it 'runs report job' do
        post "/api/v2/administration/data_reports/#{data_report_id}/run",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        job = data_report.data_report_jobs.first

        expect(job).to be_present
        expect(AdminJobRecord.last).to eq(job.admin_job_record)
      end
    end

    describe 'global scope data reports' do
      let!(:global_data_report) { create(:data_report, :global, owner: nil) }

      describe 'GET /api/v2/administration/data_reports' do
        it 'includes global reports in the list' do
          get '/api/v2/administration/data_reports',
              params: { include: 'owner,last_updated_by' },
              headers: { 'Content-Type' => 'application/vnd.api+json' }

          expect(response).to have_http_status(:ok)
          data = JSON.parse(response.body)['data']
          scopes = data.map { |d| d['attributes']['scope'] }

          expect(scopes).to include('global')
          expect(scopes).to include('client')
        end

        it 'can filter by global scope' do
          get '/api/v2/administration/data_reports',
              params: { include: 'owner,last_updated_by', 'filter[scope_eq]' => 'global' },
              headers: { 'Content-Type' => 'application/vnd.api+json' }

          expect(response).to have_http_status(:ok)
          data = JSON.parse(response.body)['data']
          scopes = data.map { |d| d['attributes']['scope'] }.uniq

          expect(scopes).to eq(['global'])
        end
      end

      describe 'POST /api/v2/administration/data_reports/:id/run' do
        it 'runs global scope report' do
          post "/api/v2/administration/data_reports/#{global_data_report.id}/run",
               headers: { 'Content-Type' => 'application/vnd.api+json' }

          expect(response).to have_http_status(:ok)
          job = global_data_report.data_report_jobs.first

          expect(job).to be_present
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

    describe 'GET /api/v2/administration/data_reports' do
      it 'fetches client data reports list' do
        get '/api/v2/administration/data_reports',
            params: { include: 'owner,last_updated_by', 'filter[owner_id_eq]' => project2.client.id },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        dr = JSON.parse(response.body)['data']

        expect(DataReport.count).to eq(2)
        expect(dr.size).to eq(1)

        expect(dr.first).to have_attribute(:name).with_value(client_data_report.name)
      end
    end

    describe 'POST /api/v2/administration/data_reports/:client_data_report_id/run' do
      it 'runs client report job' do
        post "/api/v2/administration/data_reports/#{client_data_report.id}/run",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        job = client_data_report.data_report_jobs.first

        expect(job).to be_present
        expect(AdminJobRecord.last).to eq(job.admin_job_record)
      end
    end

    describe 'GET /api/v2/administration/data_reports/search_project' do
      before do
        allow_any_instance_of(Api::Administration::DataReportPolicy).
          to receive(:search_project?).
          and_return(true)
      end

      it 'searches projects globally' do
        matching_project = create(:project, name: 'Project 1')
        create(:project, name: 'Project 2')

        get '/api/v2/administration/data_reports/search_project',
            params: {
              filter: {
                name_cont: 'Project 1'
              }
            },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)

        parsed = JSON.parse(response.body)

        expect(parsed.pluck('id')).to include(matching_project.id)
        expect(parsed.first['name']).to eq('Project 1')
      end

      it 'searches projects for a specific client' do
        project2.update!(name: 'Client Project')

        get '/api/v2/administration/data_reports/search_project',
            params: {
              client_id: project2.client.id
            },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)

        parsed = JSON.parse(response.body)

        expect(parsed.pluck('id')).to include(project2.id)
        expect(parsed.pluck('name')).to include('Client Project')
      end
    end
  end
end
