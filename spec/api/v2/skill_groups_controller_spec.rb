# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillGroupsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/skill_groups' do
    context 'when no filter is applied' do
      it 'returns all skill groups' do
        create(:taxonomy_level, project: project, hierarchy_type: 'skill_group', depth: 0, label: 'Skill level 1')
        parent_group = create(:skill_group, project: project)
        child_group = create(:skill_group, project: project, parent: parent_group)
        create(:skill, skill_group: child_group)

        get '/api/v2/administration/skill_groups',
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
        parent_group = create(:skill_group, project: project)
        child_group = create(:skill_group, project: project, parent: parent_group)
        create(:skill, skill_group: child_group)

        get '/api/v2/administration/skill_groups',
            params: { project_id: project.id, 'filter[end_level_groups]' => true },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].size).to eq(1)
        expect(json_response['data'].first['id']).to eq(child_group.id.to_s)
      end
    end
  end
end
