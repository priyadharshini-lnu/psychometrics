# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::JobGroupsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/job_groups' do
    get 'List Job Groups' do
      operationId 'getJobGroups'
      description 'Lists job groups'
      tags 'SkillsRater'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :project_id, in: :query, type: :string, required: true
      parameter name: :'filter[end_level_groups]', in: :query, required: false, type: :string

      response '200', 'All Job Groups returned when no filter applied' do
        let(:project_id) { project.id }
        let!(:parent_group) { create(:job_group, project: project) }
        let!(:child_group) { create(:job_group, project: project, parent: parent_group) }
        let!(:job_role) { create(:job_role, job_group: child_group) }

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['data'].size).to eq(2) # Returns both parent and child group
          group_ids = json_response['data'].map { |g| g['id'] }
          expect(group_ids).to include(parent_group.id.to_s)
          expect(group_ids).to include(child_group.id.to_s)
        end
      end

      response '200', 'Only leaf nodes returned when filter applied' do
        let(:project_id) { project.id }

        let!(:root_group) { create(:job_group, project: project) }
        let!(:programming) { create(:job_group, project: project, parent: root_group) }
        let!(:design) { create(:job_group, project: project, parent: root_group) }
        let!(:backend) { create(:job_group, project: project, parent: programming) }
        let!(:frontend) { create(:job_group, project: project, parent: programming) }
        let!(:ui_design) { create(:job_group, project: project, parent: design) }

        let(:'filter[end_level_groups]') { true }

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)

          expect(json_response['data'].size).to eq(3)
          returned_ids = json_response['data'].map { |item| item['id'].to_i }
          expect(returned_ids).to match_array([backend.id, frontend.id, ui_design.id])
        end
      end
    end
  end
end
