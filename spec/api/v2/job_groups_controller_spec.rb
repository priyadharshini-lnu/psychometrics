# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::JobGroupsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/job_groups' do
    context 'when no filter is applied' do
      it 'returns all job groups' do
        parent_group = create(:job_group, project: project)
        child_group = create(:job_group, project: project, parent: parent_group)
        create(:job_role, job_group: child_group)

        get '/api/v2/administration/job_groups',
            params: { project_id: project.id },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].size).to eq(2) # Returns both parent and child group
        group_ids = json_response['data'].pluck('id')
        expect(group_ids).to include(parent_group.id.to_s)
        expect(group_ids).to include(child_group.id.to_s)
      end
    end

    context 'when end_level_groups filter is applied' do
      it 'returns only leaf nodes' do
        root_group = create(:job_group, project: project)
        programming = create(:job_group, project: project, parent: root_group)
        design = create(:job_group, project: project, parent: root_group)
        backend = create(:job_group, project: project, parent: programming)
        frontend = create(:job_group, project: project, parent: programming)
        ui_design = create(:job_group, project: project, parent: design)

        get '/api/v2/administration/job_groups',
            params: { project_id: project.id, 'filter[end_level_groups]' => true },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['data'].size).to eq(3)
        returned_ids = json_response['data'].map { |item| item['id'].to_i }
        expect(returned_ids).to match_array([backend.id, frontend.id, ui_design.id])
      end
    end
  end
end
