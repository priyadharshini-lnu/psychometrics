# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SessionsController, type: :controller do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, client: client) }
  let(:user) { create(:user) }
  let(:security_setting) { project.security_setting }

  before(:each) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
    request.host = "#{project.subdomain}.localhost"
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
  end

  describe '#determine_target_path' do
    context 'when SAML signout is available' do
      before do
        create(:saml_setting, project: project)
        controller.session[:saml_login] = true
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns SAML signout URL' do
        saml_url = project.saml_setting.after_signout_url
        expect(controller.send(:determine_target_path)).to eq(saml_url)
      end
    end

    context 'when SAML signout is not available but external logout redirect is enabled' do
      before do
        request.cookies[:sso_session] = 'true'
        security_setting.update(external_logout_redirect_enabled: true, external_logout_url: 'https://example.com/logout')
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns external logout URL' do
        expect(controller.send(:determine_target_path)).to eq('https://example.com/logout')
      end
    end

    context 'when neither SAML signout nor external logout redirect is available' do
      before do
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns new user session path' do
        expect(controller.send(:determine_target_path)).to eq(new_user_session_path)
      end
    end

    context 'when external logout redirect is enabled but session sso flag is not set' do
      before do
        security_setting.update(external_logout_redirect_enabled: true, external_logout_url: 'https://example.com/logout')
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns new user session path' do
        expect(controller.send(:determine_target_path)).to eq(new_user_session_path)
      end
    end
  end

  describe '#external_logout_available?' do
    context 'when SSO session exists and external_logout_redirect_enabled is true' do
      before do
        request.cookies[:sso_session] = 'true'
        security_setting.update(external_logout_redirect_enabled: true)
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns true' do
        expect(controller.send(:external_logout_available?)).to eq(true)
      end
    end

    context 'when SSO session does not exist' do
      before do
        security_setting.update(external_logout_redirect_enabled: true)
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns false' do
        expect(controller.send(:external_logout_available?)).to be_falsy
      end
    end

    context 'when external_logout_redirect_enabled is false' do
      before do
        request.cookies[:sso_session] = 'true'
        security_setting.update(external_logout_redirect_enabled: false)
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns false' do
        expect(controller.send(:external_logout_available?)).to be_falsy
      end
    end

    context 'when both conditions are false' do
      before do
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns false' do
        expect(controller.send(:external_logout_available?)).to be_falsy
      end
    end
  end

  describe '#external_logout_url' do
    context 'when security setting has external_logout_url' do
      before do
        security_setting.update(external_logout_url: 'https://example.com/logout')
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns the external logout URL' do
        expect(controller.send(:external_logout_url)).to eq('https://example.com/logout')
      end
    end

    context 'when security setting does not have external_logout_url' do
      before do
        security_setting.update(external_logout_url: nil)
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns nil' do
        expect(controller.send(:external_logout_url)).to be_nil
      end
    end
  end

  describe '#after_sign_out_path_for' do
    context 'when external logout redirect is available' do
      before do
        request.cookies[:sso_session] = 'true'
        security_setting.update(external_logout_redirect_enabled: true, external_logout_url: 'https://example.com/logout')
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns the external logout URL' do
        expect(controller.send(:after_sign_out_path_for, user)).to eq('https://example.com/logout')
      end
    end

    context 'when external logout redirect is not available' do
      before do
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns new user session path' do
        expect(controller.send(:after_sign_out_path_for, user)).to eq(new_user_session_path)
      end
    end

    context 'when after_signout_path is computed' do
      before do
        controller.instance_variable_set(:@after_signout_path, 'https://custom.example.com/logout')
        controller.instance_variable_set(:@current_project, project)
      end

      it 'returns the instance variable value' do
        expect(controller.send(:after_sign_out_path_for, user)).to eq('https://custom.example.com/logout')
      end
    end
  end

  describe '#compute_after_signout_path' do
    before do
      request.cookies[:sso_session] = 'true'
      security_setting.update(external_logout_redirect_enabled: true, external_logout_url: 'https://example.com/logout')
      controller.instance_variable_set(:@current_project, project)
    end

    it 'computes and stores the after_signout_path' do
      controller.send(:compute_after_signout_path)

      expect(controller.instance_variable_get(:@after_signout_path)).to eq('https://example.com/logout')
    end
  end

  describe '#destroy' do
    before do
      sign_in user
      allow(controller).to receive(:audit!)
      allow(Utility::Cookie).to receive(:expire_auth_cookies)
      allow(WardenAuthLogger).to receive(:log_sign_out)
    end

    context 'when external logout redirect is enabled' do
      before do
        security_setting.update(external_logout_redirect_enabled: true, external_logout_url: 'https://example.com/logout')
      end

      it 'redirects to external logout URL' do
        # Set session before the destroy action
        request.cookies[:sso_session] = 'true'
        delete :destroy

        expect(response).to redirect_to('https://example.com/logout')
      end

      it 'audits the sign out' do
        request.cookies[:sso_session] = 'true'
        expect(controller).to receive(:audit!).with(
          :sign_out, user,
          user: user,
          payload: { email: user.email },
          impersonated_by_id: nil
        )

        delete :destroy
      end
    end

    context 'when external logout redirect is not enabled' do
      it 'redirects to new user session path' do
        delete :destroy

        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
end
