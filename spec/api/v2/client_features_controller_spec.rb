# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ClientFeaturesController, type: :request do
  let!(:client) { create(:tenancy) }

  describe 'GET /api/v2/administration/clients/:client_id/client_features' do
    subject(:make_request) do
      get "/api/v2/administration/clients/#{client.id}/client_features",
          params: { 'filter[client_id_eq]' => client.id },
          headers: { 'Content-Type' => 'application/vnd.api+json' }
    end

    context 'when signed in as a superadmin' do
      let(:superadmin) { create(:superadmin) }

      before do
        sign_in(superadmin)
      end

      it 'returns ok and client feature settings' do
        make_request

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response['data']).not_to be_empty
        expect(json_response['data'].first).to have_key('id')
      end
    end

    context 'when signed in as a client admin with feature flag grant' do
      let(:client_admin_user) { create(:user) }
      let!(:client_admin_membership) do
        create(
          :membership,
          user: client_admin_user,
          client: client,
          role: Membership::CLIENT_ADMIN_ROLE
        )
      end
      let!(:membership_grant) do
        create(
          :membership_grants,
          membership: client_admin_membership,
          data: { 'project_settings' => %w[feature_flags] }
        )
      end

      before do
        sign_in(client_admin_user)
      end

      it 'returns ok and client feature settings' do
        make_request

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response['data']).not_to be_empty
        expect(json_response['data'].first).to have_key('id')
      end
    end

    context 'when signed in as a client admin without feature flag grant' do
      let(:client_admin_user) { create(:user) }
      let!(:client_admin_membership) do
        create(
          :membership,
          user: client_admin_user,
          client: client,
          role: Membership::CLIENT_ADMIN_ROLE
        )
      end
      let!(:membership_grant) do
        create(
          :membership_grants,
          membership: client_admin_membership,
          data: { 'libraries' => %w[manage view] }
        )
      end

      before do
        sign_in(client_admin_user)
      end

      it 'returns forbidden' do
        make_request

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'POST /api/v2/administration/clients/:client_id/client_features/migrate_communication_center' do
    let(:support_email) { 'support-admin@example.com' }
    let(:support_admin) { create(:superadmin, email: support_email) }

    before do
      allow(Settings).to receive(:support_admins).and_return(support_email)
      allow(Communications::Deliveries::Trigger).to receive(:call)
      sign_in(support_admin)
    end

    def make_migrate_request(client_id:, dry_run: nil)
      params = {}
      params[:query] = { dry_run: dry_run } if dry_run
      post "/api/v2/administration/clients/#{client_id}/client_features/migrate_communication_center",
           params: params
    end

    def response_body
      JSON.parse(response.body)
    end

    context 'when the user is not a support admin' do
      before { sign_in(create(:superadmin)) }

      it 'returns 403 forbidden' do
        make_migrate_request(client_id: client.id)
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'with dry_run=true' do
      before do
        allow(CommunicationCenter::Migrate).to receive(:new).and_return(
          instance_double(CommunicationCenter::Migrate, call: {
            would_migrate: 3,
            would_backfill: 10,
            would_users: 5,
            would_cc_users: 2,
            would_assessments: 1,
            skipped: 0,
            errors: ['comm id=9: boom'],
            dry_run: true
          })
        )
      end

      it 'returns 200 ok' do
        make_migrate_request(client_id: client.id, dry_run: true)
        expect(response).to have_http_status(:ok)
      end

      it 'returns stats in the response body' do
        make_migrate_request(client_id: client.id, dry_run: true)

        body = response_body
        expect(body['would_migrate']).to eq(3)
        expect(body['would_backfill']).to eq(10)
        expect(body['skipped']).to eq(0)
      end

      it 'renames :errors to :migration_errors in the response' do
        make_migrate_request(client_id: client.id, dry_run: true)

        body = response_body
        expect(body).to have_key('migration_errors')
        expect(body).not_to have_key('errors')
      end

      it 'does NOT enqueue an AdminJob' do
        expect { make_migrate_request(client_id: client.id, dry_run: true) }.
          not_to change(AdminJobRecord, :count)
      end

      it 'calls Migrate with dry_run: true' do
        make_migrate_request(client_id: client.id, dry_run: true)

        expect(CommunicationCenter::Migrate).
          to have_received(:new).with(an_object_having_attributes(id: client.id), dry_run: true)
      end
    end

    context 'with a live run (no dry_run param)' do
      it 'enqueues an AdminJobRecord for migrate_communication_center' do
        expect { make_migrate_request(client_id: client.id) }.
          to change(AdminJobRecord, :count).by(1)

        record = AdminJobRecord.last
        expect(record.operation).to eq('migrate_communication_center')
        expect(record.data['client_id']).to eq(client.id)
      end

      it 'returns 200 ok with an enqueued message' do
        make_migrate_request(client_id: client.id)

        expect(response).to have_http_status(:ok)
        expect(response_body['message']).to match(/enqueued/)
      end

      it 'does NOT call Migrate inline' do
        allow(CommunicationCenter::Migrate).to receive(:new).and_call_original

        make_migrate_request(client_id: client.id)

        expect(CommunicationCenter::Migrate).not_to have_received(:new)
      end
    end
  end
end
