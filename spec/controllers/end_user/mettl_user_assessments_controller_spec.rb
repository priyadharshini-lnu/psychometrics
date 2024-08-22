# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::MettlUserAssessmentsController, type: :controller do
  let!(:project) { create(:project) }
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.product_id })
  end

  let(:user_assessment) { create(:user_assessment, evaluator: user, assessment: assessment, project: project) }

  let(:campaign) { user_assessment.campaign }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }
  let(:request_params) { { id: user_assessment.id, mettl_user_assessment: { id: user_assessment.id } } }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'POST #pass' do
    before do
      allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_return(true)
      allow(AsyncRequestHandlerJob).to receive(:perform_later)
    end

    after(:each) do
      $redis.flushdb # rubocop:disable Style/GlobalVars
    end

    it 'queues the request and sets status to in progress' do
      post :pass, params: request_params

      expect(response).to have_http_status(:ok)
      expect(AsyncRequestHandlerJob).to have_received(:perform_later)

      async_request_uuid = assigns(:async_request_uuid)
      status, response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
      expect(status).to eq('not_started')
      expect(response).to be_an_instance_of(AsyncResponseRequest::AsyncResponse)
      expect(response.processing_status).to eq('not_started')
    end

    context 'when user assessment cannot be started based on sequencing' do
      before do
        allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_return(false)
      end

      it 'returns the redirect URL to the campaign path' do
        post :pass, params: request_params

        expect(response).to redirect_to(campaign_path(user_assessment.campaign_id))
      end
    end
  end

  describe 'GET #redirect' do
    before do
      session[:in_progress_mettle_assessment_details] = {
        'mettle_assessment_id' => mettl_assessment.id, 'user_assessment_id' => user_assessment.id
      }
    end

    context 'when user assessment is found in session' do
      it 'completes the user assessment and redirects to the assessment completed path' do
        get :redirect, params: { mettl_assessment_id: mettl_assessment.id }

        expect(response).to redirect_to(assessment_completed_path(campaign.id, user_assessment_id: user_assessment.id))
        expect(user_assessment.reload).to be_completed
        expect(session[:user_assessment_id]).to be_nil
      end
    end

    context 'when user assessment is not found in session' do
      before do
        session[:in_progress_mettle_assessment_details] = nil
      end

      it 'redirects to the root path' do
        get :redirect, params: { mettl_assessment_id: mettl_assessment.id }

        expect(response).to redirect_to(root_path)
      end
    end
  end
end
