# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::AIArtifactsController, type: :controller do
  let(:superadmin) { create(:superadmin) }
  let(:regular_user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:ai_assistant) { create(:assistant) }

  before do
    project_feature = campaign.project.project_feature || campaign.project.create_project_feature!
    project_feature.update!(ai_assistants: true)
    sign_in superadmin
  end

  describe 'POST #export' do
    let(:params) do
      {
        campaign_id: campaign.id
      }
    end

    context 'when user is authorized' do
      it 'initiates an export job' do
        expect(AdminJob).to receive(:call).with(
          :export_campaign_ai_artifacts,
          { campaign_id: campaign.id },
          superadmin
        )

        post :export, params: params

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('ok')
      end

      it 'audits the export action' do
        allow(AdminJob).to receive(:call)

        expect(controller).to receive(:audit!).with(
          :campaign_artifacts_export,
          campaign,
          hash_including(payload: { campaign_id: campaign.id })
        )

        post :export, params: params
      end
    end

    context 'when user is not authorized' do
      before { sign_in regular_user }

      it 'returns unauthorized' do
        post :export, params: params
        expect(response).to have_http_status(:not_found).or have_http_status(:forbidden)
      end
    end
  end

  describe 'POST #import' do
    let(:csv_content) do
      <<~CSV
        Code,Name,AIAssistantID,Instructions,IncludeAllDatasheetColumns,DependencyQuestionIDs,DependencyCampaignFactorIDs,DependencySheetColumnIDs
        test_artifact,Test Artifact,#{ai_assistant.id},Test instructions,false,,,
      CSV
    end
    let(:file) { Rack::Test::UploadedFile.new(StringIO.new(csv_content), 'text/csv', original_filename: 'test.csv') }
    let(:params) do
      {
        campaign_id: campaign.id,
        data: {
          attributes: {
            file: file
          }
        }
      }
    end

    context 'when user is authorized' do
      before do
        allow(AdminJob).to receive(:call)
      end

      it 'queues an import job' do
        expect(AdminJob).to receive(:call) do |job, job_data, job_user, job_file|
          expect(job).to eq(:import_campaign_ai_artifacts)
          expect(job_data).to eq(campaign_id: campaign.id)
          expect(job_user).to eq(superadmin)
          expect(job_file).to be_a(ActionDispatch::Http::UploadedFile)
          expect(job_file.original_filename).to eq('test.csv')
          expect(job_file.content_type).to eq('text/csv')
        end

        post :import, params: params

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq('ok')
      end

      it 'audits the import action' do
        expect(controller).to receive(:audit!).with(
          :campaign_artifacts_import,
          campaign,
          hash_including(payload: { campaign_id: campaign.id })
        )

        post :import, params: params
      end
    end

    context 'when file is missing' do
      let(:params_without_file) do
        {
          campaign_id: campaign.id,
          data: {
            attributes: {}
          }
        }
      end

      it 'returns an error' do
        post :import, params: params_without_file

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = response.parsed_body
        expect(json_response['errors']).to be_present
      end
    end

    context 'when user is not authorized' do
      before { sign_in regular_user }

      it 'returns unauthorized' do
        post :import, params: params
        expect(response).to have_http_status(:not_found).or have_http_status(:forbidden)
      end
    end
  end
end
