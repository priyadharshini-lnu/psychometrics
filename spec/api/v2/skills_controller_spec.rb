# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillsController, type: :controller do
  let(:project_manager) { create(:user) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: project_manager)
  end

  describe 'GET #index' do
    let(:project) { Project.find(create(:project).id) }
    let(:other_project) { Project.find(create(:project).id) }
    let!(:ruby_skill) { create(:skill, name: 'Ruby Engineering', project: project, category: 'technical') }
    let!(:python_skill) { create(:skill, name: 'Python Engineering', project: nil, category: 'technical') }
    let!(:java_skill) { create(:skill, name: 'Java Engineering', project: other_project, category: 'technical') }
    let!(:communication) { create(:skill, name: 'Engineering Communication', project: project, category: 'behavioral') }
    let!(:leadership) { create(:skill, name: 'Engineering Leadership', project: nil, category: 'behavioral') }

    before do
      sign_in project_manager
      create(:membership, user: project_manager, client: client, role: 'client_admin')
      allow_any_instance_of(Api::Administration::SkillPolicy).to receive(:index?).and_return(true)
      allow_any_instance_of(Api::Administration::SkillPolicy::Scope).to receive(:resolve).and_return(Skill.all)
    end

    context 'with name_cont filter' do
      it 'returns skills matching the name pattern' do
        get :index, params: { filter: { name_cont: 'Ruby' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Ruby Engineering'])
      end
    end

    context 'with category_in filter' do
      it 'returns skills in the specified category' do
        get :index, params: { filter: { category_in: 'technical', name_cont: 'Engineering' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Ruby Engineering', 'Python Engineering', 'Java Engineering'])
      end

      it 'returns skills in multiple categories' do
        get :index, params: { filter: { category_in: 'technical,behavioral', name_cont: 'ing' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array([
          'Ruby Engineering',
          'Python Engineering',
          'Java Engineering',
          'Engineering Communication',
          'Engineering Leadership'
        ])
      end
    end

    context 'with project_id_eq filter' do
      it 'returns skills for the specified project' do
        get :index, params: { filter: { project_id_eq: project.id, name_cont: 'ing' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Ruby Engineering', 'Engineering Communication'])
      end
    end

    context 'with global scope' do
      it 'returns only global skills' do
        get :index, params: { filter: { global: 'true', name_cont: 'ing' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Python Engineering', 'Engineering Leadership'])
      end
    end

    context 'with all_skills scope' do
      it 'returns all skills' do
        get :index, params: { filter: { all_skills: 'true', name_cont: 'ing' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array([
          'Ruby Engineering',
          'Python Engineering',
          'Java Engineering',
          'Engineering Communication',
          'Engineering Leadership'
        ])
      end
    end

    context 'with multiple combined filters' do
      it 'returns skills matching name pattern and category' do
        get :index, params: {
          filter: {
            name_cont: 'Engineering',
            category_in: 'technical'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Ruby Engineering', 'Python Engineering', 'Java Engineering'])
      end

      it 'returns skills matching name pattern and project' do
        get :index, params: {
          filter: {
            name_cont: 'Ruby',
            project_id_eq: project.id
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Ruby Engineering'])
      end

      it 'returns skills matching category and project' do
        get :index, params: {
          filter: {
            category_in: 'behavioral',
            project_id_eq: project.id,
            name_cont: 'ion'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Engineering Communication'])
      end

      it 'returns global skills matching category' do
        get :index, params: {
          filter: {
            global: 'true',
            category_in: 'behavioral',
            name_cont: 'ship'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Engineering Leadership'])
      end

      it 'returns skills matching name pattern, category, and project' do
        get :index, params: {
          filter: {
            name_cont: 'Engineering',
            category_in: 'technical',
            project_id_eq: other_project.id
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Java Engineering'])
      end

      it 'returns empty array when no skills match all filters' do
        get :index, params: {
          filter: {
            name_cont: 'NonExistent',
            category_in: 'behavioral',
            project_id_eq: project.id
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['data']).to be_empty
      end
    end

    context 'with no results' do
      it 'returns an empty array' do
        get :index, params: { filter: { name_cont: 'NonExistent' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['data']).to be_empty
      end
    end

    context 'with user access control' do
      let(:limited_user) { create(:user) }
      let(:accessible_project) { Project.find(create(:project, client: client).id) }
      let!(:accessible_skill) { create(:skill, name: 'Accessible Skill', project: accessible_project) }
      let!(:inaccessible_skill) { create(:skill, name: 'Inaccessible Skill', project: project) }

      before do
        sign_in limited_user
        create(:membership, user: limited_user, client: client, role: 'client_admin')
        allow_any_instance_of(Api::Administration::SkillPolicy::Scope).to receive(:resolve).
          and_return(Skill.where(project_id: [nil, accessible_project.id]))
      end

      it 'returns only accessible skills' do
        get :index, params: { filter: { name_cont: 'Skill' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |s| s['attributes']['name'] }
        expect(names).to match_array(['Accessible Skill'])
        expect(names).not_to include('Inaccessible Skill')
      end
    end
  end

  describe 'GET #tags_search' do
    let(:project) { Project.find(create(:project).id) }
    let!(:skill) { create(:skill, name: 'Ruby Engineering', project: project) }
    let!(:global_skill) { create(:skill, name: 'Python Engineering', project: nil) }
    let!(:technical_skill) { create(:skill, name: 'Java Engineering', project: project, category: :technical) }
    let!(:behavioral_skill) { create(:skill, name: 'Leadership', project: project, category: :behavioral) }

    before do
      sign_in project_manager
      allow_any_instance_of(Api::Administration::SkillPolicy).to receive(:tags_search?).and_return(true)
      allow_any_instance_of(Api::Administration::SkillPolicy::Scope).to receive(:resolve).and_return(Skill.all)

      ActsAsTaggableOn::Tag.create!(name: 'ruby programming')
      ActsAsTaggableOn::Tag.create!(name: 'python programming')
      ActsAsTaggableOn::Tag.create!(name: 'java skills')
      ActsAsTaggableOn::Tag.create!(name: 'leadership skills')

      skill.tag_list.add('ruby programming')
      skill.save!
      global_skill.tag_list.add('python programming')
      global_skill.save!
      technical_skill.tag_list.add('java skills')
      technical_skill.save!
      behavioral_skill.tag_list.add('leadership skills')
      behavioral_skill.save!
    end

    context 'with valid query' do
      it 'returns matching tags for project' do
        get :tags_search, params: { filter: { project_id_eq: project.id, name_cont: 'ruby' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['data'].first['attributes']['name']).to eq('ruby programming')
      end

      it 'returns global tags when no project_id is provided' do
        get :tags_search, params: { filter: { name_cont: 'python' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['data'].first['attributes']['name']).to eq('python programming')
      end

      it 'returns all tags when all parameter is true' do
        get :tags_search, params: { filter: { all: 'true', name_cont: 'programming' } }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |tag| tag['attributes']['name'] }
        expect(names).to include('ruby programming', 'python programming')
      end
    end

    context 'with invalid parameters' do
      it 'returns error when both all=true and project_id are provided' do
        get :tags_search, params: {
          filter: {
            all: 'true',
            project_id_eq: project.id,
            name_cont: 'programming'
          }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq(
          'errors' => [
            {
              'source' => { 'pointer' => '/filter' },
              'status' => '422',
              'title' => I18n.t('administration.skills.errors.search.all_and_project_id_mutually_exclusive')
            }
          ]
        )
      end
    end

    context 'with missing required parameters' do
      it 'returns error when filter is missing' do
        get :tags_search, params: {}

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq(
          'errors' => [
            {
              'source' => { 'pointer' => '/filter' },
              'status' => '422',
              'title' => "can't be blank"
            }
          ]
        )
      end

      it 'returns error when name_cont is missing' do
        get :tags_search, params: { filter: { project_id_eq: project.id } }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq(
          'errors' => [
            {
              'source' => { 'pointer' => '/filter/name_cont' },
              'status' => '422',
              'title' => "can't be blank"
            }
          ]
        )
      end
    end

    context 'with category_in filter' do
      it 'returns tags from technical skills only' do
        get :tags_search, params: {
          filter: {
            category_in: 'technical',
            name_cont: 'skills',
            all: 'true'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |tag| tag['attributes']['name'] }
        expect(names).to include('java skills')
        expect(names).not_to include('leadership skills')
      end

      it 'returns tags from behavioral skills only' do
        get :tags_search, params: {
          filter: {
            category_in: 'behavioral',
            name_cont: 'skills',
            all: 'true'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |tag| tag['attributes']['name'] }
        expect(names).to include('leadership skills')
        expect(names).not_to include('java skills')
      end

      it 'returns tags from multiple categories' do
        get :tags_search, params: {
          filter: {
            category_in: 'technical,behavioral',
            name_cont: 'skills',
            all: 'true'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |tag| tag['attributes']['name'] }
        expect(names).to include('leadership skills', 'java skills')
      end

      it 'combines category filter with project filter' do
        get :tags_search, params: {
          filter: {
            category_in: 'technical',
            project_id_eq: project.id,
            name_cont: 'java'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |tag| tag['attributes']['name'] }
        expect(names).to include('java skills')
        expect(names).not_to include('python programming', 'leadership skills')
      end

      it 'returns all matching tags when all parameter is true' do
        get :tags_search, params: {
          filter: {
            category_in: 'technical,behavioral',
            all: 'true',
            name_cont: 'skills'
          }
        }

        expect(response).to have_http_status(:ok)
        parsed_response = JSON.parse(response.body)
        names = parsed_response['data'].map { |tag| tag['attributes']['name'] }
        expect(names).to include('leadership skills', 'java skills')
      end
    end
  end

  describe 'POST #import' do
    let(:csv_file) do
      fixture_file_upload(
        Rails.root.join('spec/fixtures/files/skills.csv'),
        'text/csv'
      )
    end

    context 'when user is authorized' do
      before do
        sign_in project_manager
        allow_any_instance_of(Api::Administration::SkillPolicy).to receive(:import?).and_return(true)
      end

      context 'with valid file' do
        before do
          allow(AdminJob).to receive(:call).and_return(true)
          # Mock the CSV content with valid headers
          allow(CSV).to receive(:parse).and_return([%w[ID Name Description Project]])
          allow_any_instance_of(Api::V2::Administration::SkillImportForm).to receive(:valid?).and_return(true)
        end

        it 'queues import job successfully' do
          post :import, params: { file: csv_file }

          expect(AdminJob).to have_received(:call) do |job_type, options, user, file|
            expect(job_type).to eq(:import_skills)
            expect(options).to eq(ignore_duplicates: false)
            expect(user).to eq(project_manager)
            expect(file).to be_a(ActionDispatch::Http::UploadedFile)
            expect(file.content_type).to eq('text/csv')
          end
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to include('message' => 'Skills import job has been queued')
        end

        it 'respects ignore_duplicates parameter' do
          post :import, params: { file: csv_file, ignore_duplicates: true }

          expect(AdminJob).to have_received(:call) do |job_type, options, user, file|
            expect(job_type).to eq(:import_skills)
            expect(options).to eq(ignore_duplicates: true)
            expect(user).to eq(project_manager)
            expect(file).to be_a(ActionDispatch::Http::UploadedFile)
            expect(file.content_type).to eq('text/csv')
          end
          expect(response).to have_http_status(:ok)
        end
      end

      context 'with invalid file format' do
        let(:invalid_file) do
          fixture_file_upload(
            Rails.root.join('spec/fixtures/files/invalid.txt'),
            'text/plain'
          )
        end

        it 'returns error for invalid file format' do
          post :import, params: { file: invalid_file }

          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['errors']).to include('File must be a CSV file')
        end
      end

      context 'with invalid CSV content' do
        let(:invalid_csv_file) do
          fixture_file_upload(
            Rails.root.join('spec/fixtures/files/invalid_skills.csv'),
            'text/csv'
          )
        end

        it 'returns error for missing required columns' do
          post :import, params: { file: invalid_csv_file }

          expect(response).to have_http_status(:unprocessable_entity)
          errors = JSON.parse(response.body)['errors']
          expect(errors).to include(match(/Missing required columns/))
        end
      end

      context 'without file' do
        it 'returns error for missing file' do
          post :import

          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['errors']).to include('File can\'t be blank')
        end
      end
    end

    context 'when user is not authorized' do
      let(:unauthorized_user) { create(:user) }

      before do
        sign_in unauthorized_user
        allow_any_instance_of(Api::Administration::SkillPolicy).to receive(:import?).and_return(false)
      end

      it 'returns forbidden status' do
        post :import, params: { file: csv_file }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
