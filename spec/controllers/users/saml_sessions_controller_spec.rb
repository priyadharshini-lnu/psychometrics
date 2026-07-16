# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SamlSessionsController, type: :controller do
  let(:client) { create(:tenancy) }
  let(:user) { create(:client_admin, client: client) }

  before do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  def valid_intent_token(email, exp: 5.minutes.from_now.to_i, return_url: nil)
    expiry_duration = (exp - Time.current.to_i).seconds
    AdminAuth::SamlIntentToken.encode(email: email, return_url: return_url, expiry: expiry_duration)
  end

  describe 'GET #new' do
    before do
      authrequest_double = instance_double(OneLogin::RubySaml::Authrequest)
      allow(controller).to receive(:saml_config).and_return(OneLogin::RubySaml::Settings.new)
      allow(OneLogin::RubySaml::Authrequest).to receive(:new).and_return(authrequest_double)
      allow(authrequest_double).to receive(:create).and_return('https://idp.example.com/sso')
      allow(GetProjectBySubdomain).to receive(:call!).and_return(create(:project, client: client))
    end

    context 'when saml_email_token param is present' do
      it 'uses the token as RelayState for IdP round-trip' do
        token = valid_intent_token(user.email)
        get :new, params: { saml_email_token: token }

        expect(controller.send(:relay_state)).to eq(token)
      end
    end
  end

  describe '#relay_state' do
    before do
      authrequest_double = instance_double(OneLogin::RubySaml::Authrequest)
      allow(controller).to receive(:saml_config).and_return(OneLogin::RubySaml::Settings.new)
      allow(OneLogin::RubySaml::Authrequest).to receive(:new).and_return(authrequest_double)
      allow(authrequest_double).to receive(:create).and_return('https://idp.example.com/sso')
      allow(GetProjectBySubdomain).to receive(:call!).and_return(create(:project, client: client))
    end

    context 'when saml_email_token param is present' do
      it 'returns the saml_email_token (admin flow takes priority)' do
        token = valid_intent_token(user.email)
        get :new, params: { saml_email_token: token, return_url: '/some/path' }

        expect(controller.send(:relay_state)).to eq(token)
      end
    end

    context 'when only return_url param is present (end-user flow)' do
      it 'returns the return_url' do
        get :new, params: { return_url: '/admin/projects/288/campaigns' }

        expect(controller.send(:relay_state)).to eq('/admin/projects/288/campaigns')
      end
    end

    context 'when both params are absent' do
      it 'returns nil' do
        get :new

        expect(controller.send(:relay_state)).to be_nil
      end
    end
  end

  describe '#after_sign_in_path_for' do
    context 'when RelayState is a JWT with a return_url (admin flow)' do
      it 'returns the return_url from the JWT payload' do
        token = valid_intent_token(user.email, return_url: '/admin/clients/123/projects')
        allow(controller).to receive(:params).and_return(
          ActionController::Parameters.new(RelayState: token)
        )
        allow(Current).to receive(:client_admin_context?).and_return(false)

        expect(controller.after_sign_in_path_for(user)).to eq('/admin/clients/123/projects')
      end
    end

    context 'when RelayState is a plain URL (end-user flow)' do
      it 'returns the plain URL' do
        allow(controller).to receive(:params).and_return(
          ActionController::Parameters.new(RelayState: '/admin/projects/288/campaigns')
        )
        allow(Current).to receive(:client_admin_context?).and_return(false)

        expect(controller.after_sign_in_path_for(user)).to eq('/admin/projects/288/campaigns')
      end
    end

    context 'when client_admin_context with a client' do
      it 'returns the client projects path regardless of RelayState' do
        ActsAsTenant.current_tenant = client
        Current.admin_context = :client_admin
        Current.client = client
        allow(controller).to receive(:params).and_return(ActionController::Parameters.new({}))

        expect(controller.after_sign_in_path_for(user)).to include("/clients/#{client.id}/projects")
      end
    end
  end

  # after_saml_login is an after_action on :create. We test it as a public method
  # directly to avoid fighting Devise's full SAML authentication chain in unit tests.
  describe '#after_saml_login' do
    before do
      ActsAsTenant.current_tenant = client
      Current.admin_context = :client_admin
      Current.client = client
      allow(controller).to receive(:current_user).and_return(user)
      allow(controller).to receive(:user_signed_in?).and_return(true)
      allow(controller).to receive(:sign_out)
      allow(AdminAuth::ResolveClientAccess).to receive(:call).and_return({ ok: { client_id: client.id } })
      allow(controller).to receive(:store_client_session_data)
      allow(controller).to receive(:audit!)
    end

    context 'when RelayState contains a valid token matching the signed-in user' do
      before { controller.params = ActionController::Parameters.new(RelayState: valid_intent_token(user.email)) }

      it 'does not sign out the user' do
        controller.after_saml_login
        expect(controller).not_to have_received(:sign_out)
      end

      it 'does not set an alert flash' do
        controller.after_saml_login
        expect(flash[:alert]).to be_nil
      end
    end

    context 'when RelayState contains a valid token for a different email' do
      before { controller.params = ActionController::Parameters.new(RelayState: valid_intent_token('other@example.com')) }

      it 'signs out the authenticated user' do
        controller.after_saml_login
        expect(controller).to have_received(:sign_out).with(user)
      end

      it 'sets the sso_email_mismatch alert' do
        controller.after_saml_login
        expect(flash[:alert]).to eq(I18n.t('admin.sso_email_mismatch'))
      end
    end

    context 'when RelayState contains an expired token' do
      before do
        expired_token = valid_intent_token(user.email, exp: 1.minute.ago.to_i)
        controller.params = ActionController::Parameters.new(RelayState: expired_token)
      end

      # Expired tokens are treated as absent (JWT::ExpiredSignature < JWT::DecodeError is rescued)
      # — graceful degradation: login still proceeds rather than blocking.
      it 'allows the login through without signing out' do
        controller.after_saml_login
        expect(controller).not_to have_received(:sign_out)
      end
    end

    context 'when RelayState contains a tampered/invalid token' do
      before { controller.params = ActionController::Parameters.new(RelayState: 'not.a.valid.jwt') }

      it 'allows the login through without signing out (graceful degradation)' do
        controller.after_saml_login
        expect(controller).not_to have_received(:sign_out)
      end
    end

    context 'when no token is present in RelayState (direct SAML URL navigation)' do
      before { controller.params = ActionController::Parameters.new({}) }

      it 'allows the login through without any mismatch check' do
        controller.after_saml_login

        expect(controller).not_to have_received(:sign_out)
        expect(flash[:alert]).to be_nil
      end
    end

    context 'when email comparison is case-insensitive' do
      before { controller.params = ActionController::Parameters.new(RelayState: valid_intent_token(user.email.upcase)) }

      it 'treats uppercase and lowercase emails as matching' do
        controller.after_saml_login
        expect(controller).not_to have_received(:sign_out)
      end
    end
  end
end
