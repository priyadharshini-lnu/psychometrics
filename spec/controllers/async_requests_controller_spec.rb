# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AsyncRequestsController, type: :controller do
  let(:uuid) { 'dsdasdsds' }
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, saville_user_assessment: build(:saville_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET #status' do
    it 'returns the status and response' do
      async_response = AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: async_request_uuid, processing_status: :in_progress
      )

      AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)

      get :status, params: { async_request_uuid: async_request_uuid }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq({
        'status' => 'in_progress',
        'response' => {
          'processing_status' => 'in_progress',
          'async_request_uuid' => async_request_uuid,
          'response_data' => {},
          'response_type' => 'json'
        }
      })
    end
  end
end
