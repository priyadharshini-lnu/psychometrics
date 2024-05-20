# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::HoganUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:assessment) { create(:hogan_assessment) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, evaluator: user, subject: user) }

  let(:campaign) { user_assessment.campaign }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }
  let(:request_params) { { id: user_assessment.id, hogan_user_assessment: { id: user_assessment.id } } }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'POST #pass' do
    before do
      allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_return(true)
      allow(AsyncRequestHandlerJob).to receive(:perform_later)
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
end
