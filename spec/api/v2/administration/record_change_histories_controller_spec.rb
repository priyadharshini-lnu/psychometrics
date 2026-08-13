# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::RecordChangeHistoriesController, type: :request do
  let(:current_user) { create(:superadmin, email: 'support-admin@example.com') }
  let(:record_id) { 999_999 }

  before do
    allow(Settings).to receive(:support_admins).and_return('support-admin@example.com')
    sign_in(current_user)
  end

  describe 'POST /api/v2/administration/record_change_histories/search' do
    it 'queues the search and returns an async_request_uuid' do
      post '/api/v2/administration/record_change_histories/search',
           params: { record_type: 'Dimension', record_id: record_id }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['async_request_uuid']).to be_present
      expect(AsyncRequestHandlerJob).to have_been_enqueued.with(
        hash_including(
          context: hash_including(params: hash_including('record_type' => 'Dimension')),
          handler: ActiveRecordAuditLogs::RecordHistorySearchHandler
        )
      )
    end

    context 'when the user is not a support admin' do
      let(:current_user) { create(:client_admin) }

      it 'is forbidden' do
        post '/api/v2/administration/record_change_histories/search',
             params: { record_type: 'Dimension', record_id: record_id }

        expect(response).to have_http_status(:forbidden)
        expect(AsyncRequestHandlerJob).not_to have_been_enqueued
      end
    end
  end

  describe 'GET /api/v2/administration/record_change_histories/auditable_types' do
    before do
      Rails.cache.delete('active_record_auditable_types')
      create(:active_record_audit, auditable_type: 'Dimension', auditable_id: record_id)
    end

    it 'returns the distinct auditable types' do
      get '/api/v2/administration/record_change_histories/auditable_types'

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include('Dimension')
    end

    context 'when the user is not a support admin' do
      let(:current_user) { create(:client_admin) }

      it 'is forbidden' do
        get '/api/v2/administration/record_change_histories/auditable_types'

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'GET /api/v2/administration/record_change_histories/revision' do
    it 'returns empty attributes when no version is given' do
      get '/api/v2/administration/record_change_histories/revision',
          params: { record_type: 'Dimension', record_id: record_id }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['attributes']).to eq({})
    end

    it 'reconstructs the record state at the given version' do
      dimension = create(:dimension)

      get '/api/v2/administration/record_change_histories/revision',
          params: { record_type: 'Dimension', record_id: dimension.id, version: 1 }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['attributes']).to include('id' => dimension.id)
    end
  end

  describe 'POST /api/v2/administration/record_change_histories/export' do
    let(:dimension) { create(:dimension) }

    it 'schedules an export job' do
      expect do
        post '/api/v2/administration/record_change_histories/export',
             params: { record_type: 'Dimension', record_id: dimension.id }
      end.to change(AdminJobRecord, :count).by(1)

      expect(response).to have_http_status(:accepted)
    end

    context 'when the user is not a support admin' do
      let(:current_user) { create(:client_admin) }

      it 'is forbidden' do
        post '/api/v2/administration/record_change_histories/export',
             params: { record_type: 'Dimension', record_id: dimension.id }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
