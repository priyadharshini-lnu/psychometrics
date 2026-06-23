# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Projects::InterviewQuestionsController, type: :request do
  let!(:project) { create(:project) }
  let!(:superadmin) { create(:superadmin) }
  let!(:client_admin) { create(:client_admin, client: project.client) }
  let!(:project_id) { project.id }
  let!(:idp_template) { create(:idp_template, project_id: project.id) }
  let!(:interview_question) { create(:interview_question, project_id: project.id, question: 'test question') }
  let!(:interview_question2) { create(:interview_question, project_id: project.id, question: 'test question2') }
  let!(:idp_template_interview_questions) do
    interview_question2.idp_template_interview_questions.create(idp_template_id: idp_template.id)
  end

  before { sign_in(superadmin) }

  describe 'GET /projects/:project_id/interview_questions' do
    it 'returns interview questions' do
      get "/api/v2/administration/projects/#{project_id}/interview_questions",
          params: { 'filter[project_id_eq]' => project_id },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data'].first
      expect(data).to have_key('id')
      expect(data).to have_attribute(:question).with_value('test question')
    end
  end

  describe 'POST /projects/:project_id/interview_questions' do
    it 'creates an interview question' do
      body = {
        data: {
          type: 'interview_questions',
          attributes: {
            question: 'New interview question',
            description: 'Interview question description',
            question_type: 'audio',
            mandatory: true,
            time_limit: 300
          },
          relationships: {
            project: {
              data: {
                type: 'clients',
                id: project_id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/interview_questions",
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:question).with_value('New interview question')
    end

    it 'returns error for invalid data' do
      body = {
        data: {
          type: 'interview_questions',
          attributes: {
            question: '' # Invalid empty question
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/interview_questions",
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PUT /projects/:project_id/interview_questions/:id' do
    it 'updates an interview question' do
      body = {
        data: {
          type: 'interview_questions',
          id: interview_question.id.to_s,
          attributes: {
            question: 'Updated interview question',
            description: 'Updated interview question description',
            question_type: 'audio',
            mandatory: true,
            time_limit: 300
          },
          relationships: {
            project: {
              data: {
                type: 'clients',
                id: project_id.to_s
              }
            }
          }
        }
      }

      put "/api/v2/administration/projects/#{project_id}/interview_questions/#{interview_question.id}",
          params: body.to_json,
          headers: {
            'Content-Type' => 'application/vnd.api+json'
          }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:question).with_value('Updated interview question')
    end

    it 'returns error for invalid data' do
      body = {
        data: {
          type: 'interview_questions',
          id: interview_question.id.to_s,
          attributes: {
            question: '' # Invalid empty question
          }
        }
      }

      put "/api/v2/administration/projects/#{project_id}/interview_questions/#{interview_question.id}",
          params: body.to_json,
          headers: {
            'Content-Type' => 'application/vnd.api+json'
          }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'DELETE /projects/:project_id/interview_questions/:id' do
    it 'deletes an interview question' do
      delete "/api/v2/administration/projects/#{project_id}/interview_questions/#{interview_question.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
    end

    it 'returns error when deletion fails' do
      # Simulate condition where deletion might fail
      allow_any_instance_of(InterviewQuestion).to receive(:destroy).and_return(false)

      delete "/api/v2/administration/projects/#{project_id}/interview_questions/#{interview_question.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'POST /projects/:project_id/interview_questions/export' do
    it 'queues export job successfully' do
      post "/api/v2/administration/projects/#{project_id}/interview_questions/export",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /projects/:project_id/interview_questions/import' do
    let(:file) do
      Rack::Test::UploadedFile.new(
        Rails.public_path.join('example_csv/import_interview_questions_sample.csv'), 'text/csv'
      )
    end

    it 'queues import job' do
      post "/api/v2/administration/projects/#{project_id}/interview_questions/import",
           params: { file: file, project_id: project_id }

      expect(response).to have_http_status(:ok)
    end
  end
end
