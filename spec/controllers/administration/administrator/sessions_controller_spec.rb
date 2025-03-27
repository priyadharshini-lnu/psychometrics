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

      it 'redirects to saml_signin_url' do
        expect(response).to have_http_status(:redirect)
        expect(response).to redirect_to(new_saml_user_session_url)
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
end
