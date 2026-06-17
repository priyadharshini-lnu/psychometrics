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
end
