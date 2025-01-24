# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillsController, type: :controller do
  let(:project_manager) { create(:superadmin) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: project_manager)
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
