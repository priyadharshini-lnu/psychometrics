# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ProjectAssessmentsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:project_assessment) { create(:project_assessment, project_id: project.id) }
  let!(:project_id) { project.id }
  let!(:project_assessment_id) { project_assessment.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/projects/{project_id}/project_assessments/' do
    get 'Assessment List' do
      operationId 'AssessmentList'
      description 'Fetch Assessment list'

      tags 'Assessment'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Assessment List' do
        schema '$ref' => '#/components/schemas/ProjectAssessmentListResponse'

        examples 'application/json' => [{
          type: 'project_assessments',
          data: {
            id: '1',
            attributes: {
              project_id: '1',
              assessment_id: '1',
              normalize_factor_scores: false
            }
          }
        }]

        run_test! do |response|
          assessments = JSON.parse(response.body)
          assessment_response = assessments['data'].find { |c| c['id'] == project_assessment.id.to_s }
          expect(assessment_response).to have_key('id')
          expect(assessment_response).to have_attribute(:project_id).with_value(project_id.to_s)
          expect(assessment_response).to have_attribute(:assessment_id).with_value(project_assessment.assessment_id)
          expect(assessment_response).to have_attribute(:normalize_factor_scores).with_value(
            project_assessment.normalize_factor_scores
          )
        end
      end
    end
  end

  path '/projects/{project_id}/project_assessments/' do
    post 'Create an Project Assessment' do
      operationId 'CreateProjectAssessment'
      description 'Create new Project Assessment'
      tags 'Project Assessment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/ProjectAssessmentCreateRequest' },
                required: true

      response '201', 'Project Assessment created' do
        schema '$ref' => '#/components/schemas/ProjectAssessmentResponse'

        examples 'application/json' => {
          type: 'project_assessments',
          data: {
            id: '1',
            attributes: {
              project_id: '1',
              assessment_id: '1',
              normalize_factor_scores: false
            }
          }
        }

        let!(:body) do
          {
            data: {
              type: 'project_assessments',
              attributes: {
                project_id: project_id.to_s,
                assessment_id: project_assessment.assessment_id,
                normalize_factor_scores: project_assessment.normalize_factor_scores
              }
            }
          }
        end

        run_test! do |response|
          assessment = JSON.parse(response.body)
          expect(assessment['data']).to have_key('id')
          expect(assessment['data']['attributes']['project_id']).to eq(project_id.to_s)
          expect(assessment['data']['attributes']['assessment_id']).to eq(project_assessment.assessment_id)
          expect(assessment['data']['attributes']['normalize_factor_scores']).to eq(
            project_assessment.normalize_factor_scores
          )
          expect(assessment['data']['attributes']['created_at']).to eq(project_assessment.decorate.created_at)
          expect(assessment['data']['attributes']['updated_at']).to eq(project_assessment.decorate.updated_at)
        end
      end
    end
  end

  path '/projects/{project_id}/project_assessments/{project_assessment_id}' do
    put 'Update an Project Assessment' do
      operationId 'UpdateProjectAssessment'
      description 'Update an Project Assessment'
      tags 'Project Assessment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :project_assessment_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/ProjectAssessmentUpdateRequest' },
                required: true

      response '200', 'Project Assessment updated' do
        schema '$ref' => '#/components/schemas/ProjectAssessmentResponse'
        examples 'application/json' => {
          data: {
            type: 'project_assessments',
            id: '1',
            attributes: {
              project_id: '1',
              assessment_id: '1',
              normalize_factor_scores: false
            }
          }
        }

        let!(:body) do
          {
            data: {
              type: 'project_assessments',
              id: project_assessment.id.to_s,

              attributes: {
                project_id: project_id.to_s,
                assessment_id: project_assessment.assessment_id,
                normalize_factor_scores: true
              }
            }
          }
        end

        run_test! do |response|
          assessment = JSON.parse(response.body)
          expect(assessment['data']).to have_key('id')
          expect(assessment['data']['attributes']['project_id']).to eq(project_id.to_s)
          expect(assessment['data']['attributes']['assessment_id']).to eq(project_assessment.assessment_id)
          expect(assessment['data']['attributes']['normalize_factor_scores']).to eq(true)
        end
      end
    end

    delete 'Delete an Project Assessment' do
      operationId 'DeleteProjectAssessment'
      description 'Delete an Project Assessment'
      tags 'Project Assessment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :project_assessment_id, in: :path, type: :string

      response '204', 'Project Assessment deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(ProjectAssessment.find_by(id: project_assessment_id)).to eq(nil)
        end
      end
    end
  end
end
