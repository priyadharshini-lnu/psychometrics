# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Administrator::SessionsController, type: :controller do
  describe 'POST #authenticate_user' do
    let(:client_admin) { create(:client_admin) }
    let(:superadmin) { create(:superadmin) }

    context 'when user is found and is a superadmin' do
      before do
        allow(Settings.features).to receive(:disable_saml_for_admins).and_return(false)
        post :authenticate_user, params: { user: { email: superadmin.email } }
      end

      it 'redirects to saml_signin_url with a saml_email_token' do
        expect(response).to have_http_status(:redirect)
        expect(response.location).to include(new_saml_user_session_url)
        expect(response.location).to include('saml_email_token=')
      end
    end

    context 'when user is found and is not a superadmin' do
      before do
        post :authenticate_user, params: { user: { email: client_admin.email } }
      end

      it 'sets the session and redirects to new_administration_session_path' do
        expect(response).to have_http_status(:redirect)
        expect(session[:user_email]).to eq(client_admin.email)
        expect(response).to redirect_to(new_administration_session_path)
      end
    end

    context 'when user has a single client' do
      let(:client) { create(:tenancy) }
      let(:sso_user) { create(:client_admin, client: client) }

      context 'with SSO enforced' do
        before do
          client.client_sso_setting.update!(
            sso_enabled: true,
            sso_enforced: true,
            idp_entity_id: 'https://idp.example.com/test',
            idp_sso_url: 'https://idp.example.com/sso/saml',
            idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read
          )
          post :authenticate_user, params: { user: { email: sso_user.email } }
        end

        it 'redirects to the client subdomain SAML login' do
          expect(response).to have_http_status(:redirect)
          expect(response.location).to include("#{client.subdomain}-admin")
          expect(response.location).to include('/users/saml/sign_in')
          expect(response.location).to include('saml_email_token=')
        end

        it 'does not set session email' do
          expect(session[:user_email]).to be_nil
        end
      end

      context 'with SSO enabled but not enforced' do
        before do
          client.client_sso_setting.update!(
            sso_enabled: true,
            sso_enforced: false,
            idp_entity_id: 'https://idp.example.com/test',
            idp_sso_url: 'https://idp.example.com/sso/saml',
            idp_cert: Rails.root.join('spec/fixtures/files/cert.pem').read
          )
          post :authenticate_user, params: { user: { email: sso_user.email } }
        end

        it 'falls through to the password form' do
          expect(session[:user_email]).to eq(sso_user.email)
          expect(response).to redirect_to(new_administration_session_path)
        end
      end
    end

    context 'when user is not found' do
      before do
        post :authenticate_user, params: { user: { email: 'random@email.com' } }
      end

      it 'sets the flash alert and redirects to new_administration_session_path' do
        expect(response).to have_http_status(:redirect)
        expect(flash[:alert]).to eq(I18n.t('devise.failure.not_found_in_database'))
        expect(response).to redirect_to(new_administration_session_path)
      end
    end
  end

  describe 'POST #create' do
    let(:client) { create(:tenancy) }

    before do
      allow(Settings.features).to receive(:disable_saml_for_admins).and_return(false)
      allow(Settings.features).to receive(:disable_recaptcha).and_return(true)
    end

    context 'when user has enforced email domain on client admin subdomain' do
      let(:user) { create(:client_admin, client: client, email: 'test@mercer.com') }

      before do
        ActsAsTenant.current_tenant = client
        allow(controller).to receive(:client_admin_context?).and_return(true)
        allow(Current).to receive(:client_admin_context?).and_return(true)
        allow(Current).to receive(:client).and_return(client)
      end

      it 'redirects to root admin SAML with saml_email_token instead of authenticating' do
        post :create, params: { user: { email: user.email, password: 'password' } }

        expect(response).to have_http_status(:redirect)
        expect(response.location).to include('/users/saml/sign_in')
        expect(response.location).to include('saml_email_token=')
        expect(response.location).not_to include(client.subdomain)
      end
    end

    context 'when user has enforced email domain on root admin' do
      let(:user) { create(:client_admin, email: 'test@mercer.com') }

      it 'redirects to SAML login with saml_email_token' do
        post :create, params: { user: { email: user.email, password: 'password' } }

        expect(response.location).to include(new_saml_user_session_url)
        expect(response.location).to include('saml_email_token=')
      end
    end

    context 'when user does not have enforced email domain on client admin subdomain' do
      let(:user) { create(:client_admin, client: client, email: 'test@example.com') }

      before do
        ActsAsTenant.current_tenant = client
        allow(controller).to receive(:client_admin_context?).and_return(true)
        allow(Current).to receive(:client_admin_context?).and_return(true)
        allow(Current).to receive(:client).and_return(client)
      end

      it 'proceeds to authentication instead of redirecting to SAML' do
        expect(User.find_by(email: user.email).saml_enforced_for_admins?).to be false
      end
    end

    context 'when user is a superadmin on a client admin subdomain' do
      let(:superadmin) { create(:superadmin) }

      before do
        ActsAsTenant.current_tenant = client
        allow(controller).to receive(:client_admin_context?).and_return(true)
      end

      it 'redirects to the administration session path' do
        post :create, params: { user: { email: superadmin.email } }

        expect(response).to redirect_to(new_administration_session_path)
        expect(flash[:alert]).to eq(I18n.t('admin.superadmin_use_root_domain',
                                           default: 'Superadmins must sign in via the root domain.'))
      end
    end
  end

  describe '#after_sign_in_path_for' do
    let(:client) { create(:tenancy) }
    let(:project) { create(:project, parent: client) }
    let(:campaign) { create(:campaign, project: project) }
    let(:assessor_user) { create(:user, :assessor, with_campaign: campaign) }

    it 'returns assessors dashboard path for pure assessor in client admin context' do
      allow(controller).to receive(:stored_location_for).and_return(nil)
      allow(Current).to receive(:client_admin_context?).and_return(true)
      allow(Current).to receive(:client).and_return(client)

      path = controller.send(:after_sign_in_path_for, assessor_user)

      expect(path).to eq(assessors_dashboard_path)
    end
  end

  describe 'DELETE #destroy' do
    let(:client_admin) { create(:client_admin) }

    before do
      sign_in client_admin
      allow(WardenAuthLogger).to receive(:log_sign_out)
    end

    it 'calls WardenAuthLogger.log_sign_out' do
      delete :destroy
      expect(WardenAuthLogger).to have_received(:log_sign_out).with(client_admin, anything, scope: :user)
    end
  end
end
