# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ProjectAssessmentsController, type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }
  let!(:project_assessment) { create(:project_assessment, project_id: project.id) }
  let!(:project_id) { project.id }
  let!(:project_assessment_id) { project_assessment.id }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/projects/:project_id/project_assessments' do
    it 'fetches Assessment list' do
      get "/api/v2/administration/projects/#{project_id}/project_assessments",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
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

  describe 'POST /api/v2/administration/projects/:project_id/project_assessments' do
    it 'creates Project Assessment' do
      body = {
        data: {
          type: 'project_assessments',
          attributes: {
            project_id: project_id.to_s,
            assessment_id: project_assessment.assessment_id,
            normalize_factor_scores: project_assessment.normalize_factor_scores,
            user_result_validity_in_days: 180
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/project_assessments",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      assessment = JSON.parse(response.body)
      expect(assessment['data']).to have_key('id')
      expect(assessment['data']['attributes']['project_id']).to eq(project_id.to_s)
      expect(assessment['data']['attributes']['assessment_id']).to eq(project_assessment.assessment_id)
      expect(assessment['data']['attributes']['normalize_factor_scores']).to eq(
        project_assessment.normalize_factor_scores
      )
      expect(assessment['data']['attributes']['user_result_validity_in_days']).to eq(180)
      expect(assessment['data']['attributes']['created_at']).to eq(project_assessment.decorate.created_at)
      expect(assessment['data']['attributes']['updated_at']).to eq(project_assessment.decorate.updated_at)
    end
  end

  describe 'PUT /api/v2/administration/projects/:project_id/project_assessments/:project_assessment_id' do
    it 'updates Project Assessment' do
      body = {
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

      put "/api/v2/administration/projects/#{project_id}/project_assessments/#{project_assessment_id}",
          params: body.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      assessment = JSON.parse(response.body)
      expect(assessment['data']).to have_key('id')
      expect(assessment['data']['attributes']['project_id']).to eq(project_id.to_s)
      expect(assessment['data']['attributes']['assessment_id']).to eq(project_assessment.assessment_id)
      expect(assessment['data']['attributes']['normalize_factor_scores']).to eq(true)
    end
  end

  describe 'DELETE /api/v2/administration/projects/:project_id/project_assessments/:project_assessment_id' do
    it 'deletes Project Assessment' do
      delete "/api/v2/administration/projects/#{project_id}/project_assessments/#{project_assessment_id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect(ProjectAssessment.find_by(id: project_assessment_id)).to eq(nil)
    end
  end
end
