# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ProficiencyLevelsController, type: :request do
  include JsonApiHelper

  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:skill) { create(:skill, project: Project.find(project.id), name: 'Ruby Programming') }
  let!(:proficiency_level) { create(:proficiency_level, project: Project.find(project.id), skill: skill) }
  before { sign_in(superadmin) }

  describe 'POST /export' do
    it 'exports proficiency levels successfully' do
      body = jsonapi_resource_request('proficiency_levels', { project_id: project.id })

      post '/api/v2/administration/proficiency_levels/export',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('export_proficiency_levels')
    end

    it 'exports without project_id for global data' do
      body = jsonapi_resource_request('proficiency_levels', {})

      post '/api/v2/administration/proficiency_levels/export',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('export_proficiency_levels')
    end
  end

  describe 'POST /export_translations' do
    it 'exports proficiency level translations successfully' do
      body = jsonapi_resource_request('proficiency_levels', { project_id: project.id })

      post '/api/v2/administration/proficiency_levels/export_translations',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('export_proficiency_level_translations')
    end
  end

  describe 'POST /import_translations' do
    it 'imports translation file successfully' do
      csv_content = "ID,English / en\n1,Basic Level"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'test.csv')

      post '/api/v2/administration/proficiency_levels/import_translations',
           params: { project_id: project.id, file: file }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('import_proficiency_level_translations')
    end

    it 'returns error for invalid file' do
      post '/api/v2/administration/proficiency_levels/import_translations',
           params: { project_id: project.id }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'POST /import' do
    it 'imports proficiency levels successfully' do
      csv_content = "ID,ProficiencyType,TotalLevels,SkillName,SkillType\n1,default,3,Ruby Programming,technical"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'test.csv')

      post '/api/v2/administration/proficiency_levels/import',
           params: { project_id: project.id, file: file }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('import_proficiency_levels')
    end

    it 'imports with ignore_duplicates flag' do
      csv_content = "ID,ProficiencyType,TotalLevels,SkillName,SkillType\n2,default,4,Ruby Programming,technical"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'test.csv')

      post '/api/v2/administration/proficiency_levels/import',
           params: { project_id: project.id, file: file, ignore_duplicates: 'true' }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('import_proficiency_levels')
      expect(AdminJobRecord.last.data).to include({ 'ignore_duplicates' => true })
    end

    it 'returns error for invalid CSV content' do
      csv_content = "InvalidHeader\nInvalidData"
      file = Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'test.csv')

      post '/api/v2/administration/proficiency_levels/import',
           params: { project_id: project.id, file: file }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end

    it 'returns error for missing file' do
      post '/api/v2/administration/proficiency_levels/import',
           params: { project_id: project.id }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['errors']).to be_present
    end
  end

  describe 'GET /skill_proficiency' do
    it 'returns proficiency level for existing skill' do
      expected_proficiency = { 'level' => 3, 'definition' => 'Advanced' }

      expect(Skills::GetProficiencyLevel).to receive(:call!).with(skill).
        and_return({ proficiency_level: expected_proficiency })

      get '/api/v2/administration/proficiency_levels/skill_proficiency',
          params: { skill_id: skill.id },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(expected_proficiency)
    end

    it 'returns empty array when no proficiency level found' do
      expect(Skills::GetProficiencyLevel).to receive(:call!).with(skill).
        and_return({ proficiency_level: nil })

      get '/api/v2/administration/proficiency_levels/skill_proficiency',
          params: { skill_id: skill.id },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([])
    end

    it 'returns 404 for non-existent skill' do
      get '/api/v2/administration/proficiency_levels/skill_proficiency',
          params: { skill_id: 999_999 },
          headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response['error']).to eq('Skill not found')
    end
  end
end
