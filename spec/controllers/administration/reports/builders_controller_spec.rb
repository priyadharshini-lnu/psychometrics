# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Reports::BuildersController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:report) { create(:report) }

  before { login_user(current_user) }
  after  { sign_out(current_user) }

  describe 'POST #publish' do
    subject { post :publish, params: { report_id: report.id } }

    context 'when the current user is not permitted to publish' do
      let(:current_user) { create(:campaign_admin) }

      it 'returns http forbidden' do
        subject

        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when the current user is permitted to publish' do
      it 'queues the publish request and creates a published snapshot with no unpublished changes remaining' do
        perform_enqueued_jobs do
          expect { subject }.to change { report.reload.published_snapshot }.from(nil)
        end

        expect(response).to have_http_status(:ok)

        async_request_uuid = assigns(:async_request_uuid)
        _status, async_response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
        expect(async_response.processing_status).to eq('completed')

        response_data = async_response.response_data['data']
        expect(response_data['has_unpublished_changes']).to be false
      end
    end
  end
end
