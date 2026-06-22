# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Projects::ReflectionQuestionsController, type: :request do
  let!(:project) { create(:project) }
  let!(:superadmin) { create(:superadmin) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let!(:client_admin) { create(:client_admin, client: project.client) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }
  let!(:project_id) { project.id }
  let!(:idp_template) { create(:idp_template, project_id: project.id) }
  let!(:reflection_question) { create(:reflection_question, project_id: project.id, question: 'test question') }
  let!(:reflection_question2) { create(:reflection_question, project_id: project.id, question: 'test question2') }
  let!(:idp_template_reflection_questions) do
    reflection_question2.idp_template_reflection_questions.create(idp_template_id: idp_template.id)
  end

  before { sign_in(superadmin) }

  describe 'GET /projects/:project_id/reflection_questions' do
    it 'returns reflection questions' do
      get "/api/v2/administration/projects/#{project_id}/reflection_questions",
          params: { 'filter[project_id_eq]' => project_id },
          headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data'].first
      expect(data).to have_key('id')
      expect(data).to have_attribute(:question).with_value('test question')
    end
  end

  describe 'POST /projects/:project_id/reflection_questions' do
    it 'creates a reflection question' do
      body = {
        data: {
          type: 'reflection_questions',
          attributes: {
            question: 'New reflection question',
            mandatory: true,
            min_words: 10,
            max_words: 500
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

      post "/api/v2/administration/projects/#{project_id}/reflection_questions",
           params: body.to_json,
           headers: {
             'Authorization' => authorization,
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:question).with_value('New reflection question')
    end

    it 'returns error for invalid data' do
      body = {
        data: {
          type: 'reflection_questions',
          attributes: {
            question: '' # Invalid empty question
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/reflection_questions",
           params: body.to_json,
           headers: {
             'Authorization' => authorization,
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PUT /projects/:project_id/reflection_questions/:id' do
    it 'updates a reflection question' do
      body = {
        data: {
          type: 'reflection_questions',
          id: reflection_question.id.to_s,
          attributes: {
            question: 'Updated reflection question',
            mandatory: false,
            min_words: 20,
            max_words: 1000
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

      put "/api/v2/administration/projects/#{project_id}/reflection_questions/#{reflection_question.id}",
          params: body.to_json,
          headers: {
            'Authorization' => authorization,
            'Content-Type' => 'application/vnd.api+json'
          }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:question).with_value('Updated reflection question')
    end

    it 'returns error for invalid data' do
      body = {
        data: {
          type: 'reflection_questions',
          id: reflection_question.id.to_s,
          attributes: {
            question: '' # Invalid empty question
          }
        }
      }

      put "/api/v2/administration/projects/#{project_id}/reflection_questions/#{reflection_question.id}",
          params: body.to_json,
          headers: {
            'Authorization' => authorization,
            'Content-Type' => 'application/vnd.api+json'
          }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'DELETE /projects/:project_id/reflection_questions/:id' do
    it 'deletes a reflection question' do
      delete "/api/v2/administration/projects/#{project_id}/reflection_questions/#{reflection_question.id}",
             headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:no_content)
    end

    it 'returns error when deletion fails' do
      # Simulate condition where deletion might fail
      allow_any_instance_of(ReflectionQuestion).to receive(:destroy).and_return(false)

      delete "/api/v2/administration/projects/#{project_id}/reflection_questions/#{reflection_question.id}",
             headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'POST /projects/:project_id/reflection_questions/export' do
    it 'exports reflection questions successfully' do
      post "/api/v2/administration/projects/#{project_id}/reflection_questions/export",
           headers: { 'Authorization' => authorization, 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('export_reflection_questions')
      expect(AdminJobRecord.last.data).to include({ 'project_id' => project_id })
    end
  end

  describe 'POST /projects/:project_id/reflection_questions/import' do
    it 'imports reflection questions successfully' do
      csv_content = "ID,Mandatory,MinWords,MaxWords,English / en\n1,yes,10,500,Sample Question"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv',
                                          original_filename: 'reflection_questions.csv')

      post "/api/v2/administration/projects/#{project_id}/reflection_questions/import",
           params: { file: file, project_id: project_id },
           headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('import_reflection_questions')
    end

    it 'returns error for missing file' do
      post "/api/v2/administration/projects/#{project_id}/reflection_questions/import",
           params: { project_id: project_id },
           headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end

    it 'returns error for invalid CSV content' do
      csv_content = "InvalidHeader\nInvalidData"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'invalid.csv')

      post "/api/v2/administration/projects/#{project_id}/reflection_questions/import",
           params: { file: file, project_id: project_id },
           headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end
end
