# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillsController, type: :request do
  include JsonApiHelper

  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:skill) { create(:skill, project: Project.find(project.id), name: 'Ruby Programming') }
  before { sign_in(superadmin) }

  describe 'GET /skills with development_actions include' do
    let!(:user_idp_plan) { create(:user_idp_plan) }
    let!(:test_skill) { create(:skill) }

    it 'calls AvailableActionsQuery when available_skills_by_plan_id filter is present' do
      allow(Idp::DevelopmentAction::AvailableActionsQuery).to receive(:new).and_call_original

      get "/api/v2/administration/skills/#{test_skill.id}",
          params: { filter: { available_skills_by_plan_id: user_idp_plan.id }, include: 'development_actions' },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(Idp::DevelopmentAction::AvailableActionsQuery).to have_received(:new).
        with(test_skill, user_idp_plan).at_least(:once)
    end

    it 'does not call AvailableActionsQuery when available_skills_by_plan_id filter is not present' do
      allow(Idp::DevelopmentAction::AvailableActionsQuery).to receive(:new).and_call_original

      get "/api/v2/administration/skills/#{test_skill.id}",
          params: { include: 'development_actions' },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(Idp::DevelopmentAction::AvailableActionsQuery).not_to have_received(:new)
    end
  end

  describe 'GET /tags_search' do
    before do
      ActsAsTaggableOn::Tag.create!(name: 'ruby programming')
      skill.tag_list.add('ruby programming')
      skill.save!
    end

    it 'returns matching tags' do
      get '/api/v2/administration/skills/tags_search',
          params: { filter: { project_id_eq: project.id, name_cont: 'ruby' } },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data.first['attributes']['name']).to eq('ruby programming')
    end

    it 'returns all tags when all parameter is true' do
      get '/api/v2/administration/skills/tags_search',
          params: { filter: { all: 'true', name_cont: 'programming' } },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      expect(data.first['attributes']['name']).to eq('ruby programming')
    end

    it 'returns error for invalid parameters' do
      get '/api/v2/administration/skills/tags_search',
          params: { filter: { all: 'true', project_id_eq: project.id, name_cont: 'ruby' } },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      expect(errors).to be_present
    end
  end

  describe 'POST /import' do
    it 'returns error for invalid file' do
      post '/api/v2/administration/skills/import',
           params: { project_id: project.id }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end

    it 'returns error for invalid CSV content' do
      csv_content = "InvalidHeader\nInvalidData"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'invalid.csv')

      post '/api/v2/administration/skills/import',
           params: { project_id: project.id, file: file }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'POST /import_translations' do
    it 'returns error for missing file' do
      post '/api/v2/administration/skills/import_translations',
           params: { project_id: project.id }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'POST /import_global' do
    it 'returns error for invalid file' do
      post '/api/v2/administration/skills/import_global',
           params: {}

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'POST /export_global' do
    it 'exports global skills successfully' do
      post '/api/v2/administration/skills/export_global',
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('export_skills')
      expect(AdminJobRecord.last.data).to include({ 'project_id' => nil })
    end
  end

  describe 'POST /import_global_translations' do
    it 'returns error for missing file' do
      post '/api/v2/administration/skills/import_global_translations',
           params: {}

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'POST /export_global_translations' do
    it 'exports global skill translations successfully' do
      post '/api/v2/administration/skills/export_global_translations',
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('export_skill_translations')
      expect(AdminJobRecord.last.data).to include({ 'project_id' => nil })
    end
  end

  describe 'POST /generate_embedding' do
    it 'generates skill embeddings successfully' do
      post '/api/v2/administration/skills/generate_embedding',
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('generate_embedding_skills')
    end
  end
end
