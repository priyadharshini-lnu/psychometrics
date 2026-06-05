# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Projects::SecuritySettingsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:security_setting) { project.security_setting }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'PUT update' do
    it 'updates security_setting if params are valid' do
      put :update, params: {
        project_id: project.id,
        id: security_setting.id,
        resource: build(:security_setting, lock_account: true, external_logout_url: 'https://example.com/login').attributes
      }, format: :json
      security_setting.reload

      parsed_response = response.parsed_body
      expected_response = security_setting.slice(
        :id, :project_id, :enforce_strong_password, :min_password_length,
        :enforce_password_policy, :disable_password_reuse, :password_expiration, :send_unlock_email,
        :auto_unlock_time, :attempts_to_lock, :lock_account, :restrict_sequences, :tfa_enabled,
        :magic_link_expiry_in_seconds, :magic_link_enabled, :disallow_password_login,
        :session_inactivity_timeout_in_seconds, :enable_recaptcha,
        :external_logout_redirect_enabled, :external_logout_url
      )
      expect(parsed_response).to eq(expected_response)
      expect(security_setting.min_password_length).to eq(8)
      expect(security_setting.lock_account).to eq(true)
      expect(response.status).to eq(200)
    end

    it 'returns 422 when external_logout_redirect_enabled is true and external_logout_url is blank' do
      put :update, params: {
        project_id: project.id,
        id: security_setting.id,
        resource: build(:security_setting, external_logout_redirect_enabled: true, external_logout_url: nil).attributes
      }, format: :json

      parsed_response = response.parsed_body
      expect(parsed_response['errors']['external_logout_url']).to include("can't be blank")
      expect(response.status).to eq(422)
    end

    it 'allows blank external_logout_url when external_logout_redirect_enabled is false' do
      put :update, params: {
        project_id: project.id,
        id: security_setting.id,
        resource: build(:security_setting, external_logout_redirect_enabled: false, external_logout_url: nil).attributes
      }, format: :json

      expect(response.status).to eq(200)
    end
  end
end
