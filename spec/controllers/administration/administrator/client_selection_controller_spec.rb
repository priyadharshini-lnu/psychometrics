# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Administrator::ClientSelectionController, type: :controller do
  let(:tenancy) { create(:tenancy) }
  let(:second_tenancy) { create(:tenancy) }

  describe 'GET #index' do
    context 'when user is a client_admin with multiple clients' do
      let(:user) { create(:client_admin, client: tenancy) }

      before do
        create(:membership, user: user, client: second_tenancy, role: 'client_admin')
        sign_in user
        get :index, format: :json
      end

      it 'responds successfully' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns json with clients' do
        body = response.parsed_body
        expect(body['clients'].length).to eq(2)
      end

      it 'includes highest_role in each client entry' do
        body = response.parsed_body
        body['clients'].each do |client|
          expect(client).to have_key('highest_role')
        end
      end
    end

    context 'when user has a single client' do
      let(:user) { create(:client_admin, client: tenancy) }

      before { sign_in user }

      it 'auto-redirects to subdomain with handoff token' do
        get :index

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include('-admin')
        expect(response.location).to include('handoff_token=')
      end

      it 'clears the central session since client switching is not needed' do
        get :index

        expect(controller.current_user).to be_nil
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in' do
        get :index
        expect(response).to have_http_status(:redirect)
      end
    end

    context 'when superadmin spoofs a multi-client user' do
      let(:superadmin) { create(:superadmin) }
      let(:target_user) { create(:client_admin, client: tenancy) }

      before do
        create(:membership, user: target_user, client: second_tenancy, role: 'client_admin')
        sign_in superadmin
      end

      it 'returns the target user clients, not superadmin clients' do
        get :index, params: { spoof_user_id: target_user.id }, format: :json

        body = response.parsed_body
        client_ids = body['clients'].pluck('id')
        expect(client_ids).to contain_exactly(tenancy.id, second_tenancy.id)
      end

      it 'includes spoof_user_id in json response' do
        get :index, params: { spoof_user_id: target_user.id }, format: :json

        body = response.parsed_body
        expect(body['spoof_user_id']).to eq(target_user.id)
      end
    end

    context 'when superadmin spoofs a single-client user' do
      let(:superadmin) { create(:superadmin) }
      let(:target_user) { create(:client_admin, client: tenancy) }

      before { sign_in superadmin }

      it 'auto-redirects with handoff token for the target user' do
        get :index, params: { spoof_user_id: target_user.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include('-admin')
        expect(response.location).to include('handoff_token=')
      end
    end

    context 'when non-superadmin passes spoof_user_id' do
      let(:user) { create(:client_admin, client: tenancy) }

      before do
        create(:membership, user: user, client: second_tenancy, role: 'client_admin')
        sign_in user
      end

      it 'ignores spoof_user_id and shows own clients' do
        other_user = create(:client_admin, client: create(:tenancy))
        get :index, params: { spoof_user_id: other_user.id }, format: :json

        body = response.parsed_body
        client_ids = body['clients'].pluck('id')
        expect(client_ids).to contain_exactly(tenancy.id, second_tenancy.id)
        expect(body['spoof_user_id']).to be_nil
      end
    end
  end

  describe 'POST #select' do
    let(:user) { create(:client_admin, client: tenancy) }

    before { sign_in user }

    context 'with a valid client the user has access to' do
      it 'redirects to the admin subdomain with handoff token' do
        post :select, params: { client_id: tenancy.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include('-admin')
        expect(response.location).to include('handoff_token=')
      end

      it 'keeps the root domain session for client switching' do
        post :select, params: { client_id: tenancy.id }

        expect(controller.current_user).to eq(user)
      end
    end

    context 'with a client the user does not have access to' do
      let(:other_tenancy) { create(:tenancy) }

      it 'raises RecordNotFound' do
        expect { post :select, params: { client_id: other_tenancy.id } }.
          to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when superadmin spoofs via select' do
      let(:superadmin) { create(:superadmin) }
      let(:target_user) { create(:client_admin, client: tenancy) }

      before { sign_in superadmin }

      it 'redirects to the target user client subdomain' do
        post :select, params: { client_id: tenancy.id, spoof_user_id: target_user.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include("#{tenancy.subdomain}-admin")
        expect(response.location).to include('handoff_token=')
      end

      it 'generates token for the target user, not superadmin' do
        post :select, params: { client_id: tenancy.id, spoof_user_id: target_user.id }

        token = CGI.unescape(response.location.match(/handoff_token=([^&]+)/)[1])
        payload = Rails.application.message_verifier('admin_handoff_token').verify(token)
        payload = payload.with_indifferent_access

        expect(payload[:user_id]).to eq(target_user.id)
        expect(payload[:impersonated_by_id]).to eq(superadmin.id)
      end
    end

    context 'when superadmin spoofs a client the target user does not have access to' do
      let(:superadmin) { create(:superadmin) }
      let(:target_user) { create(:client_admin, client: tenancy) }
      let(:inaccessible_client) { create(:tenancy) }

      before { sign_in superadmin }

      it 'raises RecordNotFound' do
        expect do
          post :select, params: { client_id: inaccessible_client.id, spoof_user_id: target_user.id }
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'POST #switch' do
    let(:user) { create(:client_admin, client: tenancy) }

    before do
      create(:membership, user: user, client: second_tenancy, role: 'client_admin')
      sign_in user
    end

    context 'when target client does not have SSO enforced' do
      it 'redirects with handoff token' do
        post :switch, params: { client_id: second_tenancy.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include("#{second_tenancy.subdomain}-admin")
        expect(response.location).to include('handoff_token=')
      end
    end

    context 'when target client has SSO enforced' do
      before do
        second_tenancy.client_sso_setting.update!(
          sso_enabled: true,
          sso_enforced: true,
          enforce_for: 'all',
          idp_entity_id: 'https://idp.example.com/test',
          idp_sso_url: 'https://idp.example.com/sso/saml',
          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read
        )
      end

      it 'redirects to SAML login on the client subdomain with a saml_email_token' do
        post :switch, params: { client_id: second_tenancy.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include("#{second_tenancy.subdomain}-admin")
        expect(response.location).to include('/users/saml/sign_in')
        expect(response.location).to include('saml_email_token=')
        expect(response.location).not_to include('handoff_token')
      end

      it 'encodes the current user email in the saml_email_token' do
        post :switch, params: { client_id: second_tenancy.id }

        token = CGI.unescape(response.location.match(/saml_email_token=([^&]+)/)[1])
        payload, = JWT.decode(token, Settings.secrets.encrypted_key, true, algorithms: ['HS256'])
        expect(payload['email']).to eq(user.email)
      end
    end

    context 'when target client has SSO enabled but not enforced' do
      before do
        second_tenancy.client_sso_setting.update!(
          sso_enabled: true,
          sso_enforced: false,
          idp_entity_id: 'https://idp.example.com/test',
          idp_sso_url: 'https://idp.example.com/sso/saml',
          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read
        )
      end

      it 'redirects with handoff token (password login allowed)' do
        post :switch, params: { client_id: second_tenancy.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include('handoff_token=')
      end
    end

    context 'when user does not have access to the client' do
      let(:other_tenancy) { create(:tenancy) }

      it 'raises RecordNotFound' do
        expect { post :switch, params: { client_id: other_tenancy.id } }.
          to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'POST #select with SSO enforcement' do
    context 'when superadmin spoofs a user to an SSO-enforced client' do
      let(:superadmin) { create(:superadmin) }
      let(:target_user) { create(:client_admin, client: tenancy) }

      before do
        tenancy.client_sso_setting.update!(
          sso_enabled: true,
          sso_enforced: true,
          enforce_for: 'all',
          idp_entity_id: 'https://idp.example.com/test',
          idp_sso_url: 'https://idp.example.com/sso/saml',
          idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read
        )
        sign_in superadmin
      end

      it 'bypasses SSO and redirects with handoff token (spoofing)' do
        post :select, params: { client_id: tenancy.id, spoof_user_id: target_user.id }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include('handoff_token=')
        expect(response.location).not_to include('/users/saml/sign_in')
      end
    end
  end

  describe 'GET #index with the feature disabled' do
    let(:user) { create(:client_admin, client: tenancy) }

    before do
      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(false)
      sign_in user
    end

    it 'sends the shell a query param instead of a flash it cannot render' do
      get :index

      expect(response.location).to include(admin_path(notice: 'feature_unavailable'))
      expect(flash[:alert]).to be_nil
    end
  end
end
