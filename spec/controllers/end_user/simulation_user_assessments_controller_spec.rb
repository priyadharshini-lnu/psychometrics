# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::SimulationUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, subject: user,
            simulation_user_assessment: build(:simulation_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }
  let(:request_params) { { id: user_assessment.id, simulation_user_assessment: { id: user_assessment.id } } }

  describe 'POST #pass' do
    before(:each) { login_user(user) }
    after(:each) { sign_out(user) }

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
    before(:each) do
      user.update(project: campaign.project)
      allow(GetProjectBySubdomain).to receive(:call!).and_return(campaign.project)
      allow(Utility::Url).to receive(:redirect_to_safe_internal_url).and_return(nil)
    end

    let(:jwt_token) do
      JWT.encode({ 'sub' => user_assessment.subject.id, 'exp' => 2.hours.from_now.to_i },
                 Settings.secrets.encrypted_key, 'HS256')
    end
    let(:request_params) { { id: user_assessment.id, jwt: jwt_token } }

    context 'when user assessment is found' do
      it 'completes the user assessment and redirects to the assessment completed path' do
        get :redirect, params: request_params

        expect(response).to redirect_to(assessment_completed_path(campaign.id, user_assessment_id: user_assessment.id))
        expect(user_assessment.reload).to be_completed
      end
    end

    context 'when user is not found' do
      it 'redirects to the root path' do
        request_params[:id] = 'invalid_id'

        get :redirect, params: request_params

        expect(response).to redirect_to(root_path)
      end
    end

    context 'when JWT token is invalid' do
      let(:jwt_token) { 'invalid_token' }

      it 'redirects to the sign_in page' do
        get :redirect, params: request_params

        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context 'when JWT token is expired' do
      let(:jwt_token) do
        JWT.encode({ 'sub' => user_assessment.subject.id, exp: 1.hour.ago.to_i }, Settings.secrets.encrypted_key,
                   'HS256')
      end

      it "doesn't complete the user assessment if not is expired" do
        get :redirect, params: request_params

        expect(user_assessment.reload).to be_not_started
      end
    end
  end
end
