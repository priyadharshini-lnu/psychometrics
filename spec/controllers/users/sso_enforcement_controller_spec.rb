# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SsoEnforcementController, type: :controller do
  let(:project) { create(:project) }
  let(:saml_setting) do
    create(:saml_setting, project: project, enabled: true, enforce_for: 'specific_domains',
enforced_domains: ['se.com'])
  end

  before do
    @request.env['devise.mapping'] = Devise.mappings[:user] if Devise.mappings[:user]
    request.host = "#{project.subdomain}.example.com"
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    allow(project).to receive(:saml_setting).and_return(saml_setting)

    allow(controller).to receive(:verify_recaptcha_or_redirect).and_return(true)
  end

  describe 'POST #check_sso' do
    context 'when email matches enforced domains' do
      it 'redirects to saml login' do
        post :check_sso, params: { user: { email: 'test@se.com' } }
        expect(response).to redirect_to(new_saml_user_session_path(return_url: nil))
      end
    end

    context 'when email does not match enforced domains' do
      it 'stores email in session and redirects to standard login' do
        post :check_sso, params: { user: { email: 'test@gmail.com' } }
        expect(session[:user_email]).to eq('test@gmail.com')
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context 'when email is nil' do
      it 'stores nil in session and redirects to standard login' do
        post :check_sso, params: { user: { email: nil } }
        expect(session[:user_email]).to eq('')
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context 'when project has no saml setting' do
      before do
        allow(project).to receive(:saml_setting).and_return(nil)
      end

      it 'redirects to standard login' do
        post :check_sso, params: { user: { email: 'test@se.com' } }
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
end
