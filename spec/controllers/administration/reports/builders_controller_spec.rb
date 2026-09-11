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
      it 'creates a published snapshot and returns it with no unpublished changes remaining' do
        expect { subject }.to change { report.reload.published_snapshot }.from(nil)

        expect(response).to have_http_status(:ok)
        parsed_response = response.parsed_body
        expect(parsed_response).to have_key('data')
        expect(parsed_response.dig('data', 'has_unpublished_changes')).to be false
      end
    end
  end
end
