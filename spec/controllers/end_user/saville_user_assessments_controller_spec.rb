# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::SavilleUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, saville_user_assessment: build(:saville_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }
  let(:request_params) { { id: user_assessment.id, saville_user_assessment: { id: user_assessment.id } } }

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

  describe 'GET redirect' do
    it 'mark user_assessment as completed if saville assessment is completed and redirect to campaign' do
      allow(Saville::GetAssessmentStatus).to receive(:call!).and_return('Completed')
      get :redirect, params: { id: user_assessment.id }

      expect(user_assessment.reload.completed?).to eq(true)
      expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
    end

    it "doesn't mark user_assessment as completed if saville assessment is not completed" do
      allow(Saville::GetAssessmentStatus).to receive(:call!).and_return('InCompleted')
      get :redirect, params: { id: user_assessment.id }

      expect(user_assessment.reload.completed?).to eq(false)
    end
  end
end
