# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::PearsonUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, subject: user, evaluator: user, pearson_user_assessment: build(:pearson_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }
  let(:request_params) { { id: user_assessment.id, pearson_user_assessment: { id: user_assessment.id } } }

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

  describe 'GET redirect' do
    before(:each) do
      user.update!(project: campaign.project)
      allow(GetProjectBySubdomain).to receive(:call!).and_return(campaign.project)
      allow(Utility::Url).to receive(:redirect_to_safe_internal_url).and_return(nil)
    end

    let(:jwt_token) do
      JWT.encode({ 'sub' => user_assessment.subject.id, 'exp' => 2.hours.from_now.to_i },
                 Settings.secrets.encrypted_key, 'HS256')
    end
    let(:request_params) { { id: user_assessment.id, jwt: jwt_token } }

    context 'when assessment is completed' do
      before { allow(Pearson::GetScheduleStatus).to receive(:call!).and_return('Completed') }

      it 'marks user_assessment as completed and redirects' do
        get :redirect, params: request_params

        expect(user_assessment.reload.completed?).to eq(true)
        expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
      end
    end

    context 'when assessment is in_progress and timed out' do
      before { allow(Pearson::GetScheduleStatus).to receive(:call!).and_return('In_Progress') }

      it 'sets status to timed_out and redirecrs' do
        get :redirect, params: request_params

        expect(user_assessment.reload.timed_out?).to eq(true)
        expect(user_assessment.completion_reason).to eq('time_out_offline')
        expect(response).to redirect_to(
          assessment_completed_path(
            campaign,
            user_assessment_id: user_assessment.id
          )
        )
      end
    end

    context 'when assessment has error' do
      before { allow(Pearson::GetScheduleStatus).to receive(:call!).and_return('Error') }

      it 'sets status to timed_out and redirects' do
        get :redirect, params: request_params

        expect(user_assessment.reload.timed_out?).to eq(true)
        expect(user_assessment.completion_reason).to eq('time_out_offline')

        expect(response).to redirect_to(
          assessment_completed_path(
            campaign,
            user_assessment_id: user_assessment.id
          )
        )
      end
    end

    context 'when assessment has result' do
      before { allow(Pearson::GetScheduleStatus).to receive(:call!).and_return('Has_Result') }

      it 'marks user_assessment as completed and redirects' do
        get :redirect, params: request_params

        expect(user_assessment.reload.completed?).to eq(true)
        expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
      end
    end
  end
end
