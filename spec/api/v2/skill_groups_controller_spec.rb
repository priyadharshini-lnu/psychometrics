# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::JobGroupsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/skill_groups' do
    get 'List Skill Groups' do
      operationId 'getSkillGroups'
      description 'Lists skill groups'
      tags 'SkillRater'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :project_id, in: :query, type: :string, required: true
      parameter name: :'filter[end_level_groups]', in: :query, required: false, type: :string

      response '200', 'All skill Groups returned when no filter applied' do
        let(:project_id) { project.id }
        let!(:parent_group_level) do
          create(:taxonomy_level, project: project, hierarchy_type: 'skill_group', depth: 0, label: 'Skill level 1')
        end
        let!(:parent_group) { create(:skill_group, project: project) }
        let!(:child_group) { create(:skill_group, project: project, parent: parent_group) }
        let!(:skill) { create(:skill, skill_group: child_group) }

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['data'].size).to eq(2) # Returns both parent and child group
          group_ids = json_response['data'].pluck('id')
          expect(group_ids).to include(parent_group.id.to_s)
          expect(group_ids).to include(child_group.id.to_s)
        end
      end

      response '200', 'Only leaf nodes returned when filter applied' do
        let(:project_id) { project.id }
        let!(:parent_group) { create(:skill_group, project: project) }
        let!(:child_group) { create(:skill_group, project: project, parent: parent_group) }
        let!(:skill) { create(:skill, skill_group: child_group) }
        let(:'filter[end_level_groups]') { true }

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['data'].size).to eq(1)
          expect(json_response['data'].first['id']).to eq(child_group.id.to_s)
        end
      end
    end
  end
end
