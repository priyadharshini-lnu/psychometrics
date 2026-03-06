# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Clients::SmtpSettingsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:client) { create(:tenancy) }
  let!(:smtp_setting) { client.create_smtp_setting!(attributes_for(:smtp_setting)) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'PUT update' do
    it 'updates smtp_setting if params are valid' do
      put :update, params: {
        client_id: client.id,
        id: smtp_setting.id,
        resource: build(
          :smtp_setting, enabled: true, host: 'gmail.com', port: '465'
        ).attributes.merge(test_email_id: 'test@example.com')
      }, format: :json
      smtp_setting.reload

      parsed_response = response.parsed_body
      expected_response = smtp_setting.slice(
        :id, :authentication_type, :enabled, :encryption, :from_name, :from_email,
        :host, :user_name, :port, :use_sender_verification
      )

      expect(parsed_response).to eq(expected_response)
      expect(smtp_setting.host).to eq('gmail.com')
      expect(smtp_setting.port).to eq(465)
      expect(response.status).to eq(200)
    end

    it "doesn't update password if password is blank, by simply ignoring" do
      old_password = 'password'
      smtp_setting.update(password: old_password)
      put :update, params: {
        client_id: client.id,
        id: smtp_setting.id,
        resource: build(
          :smtp_setting, enabled: true, host: 'gmail.com', port: '465', password: ''
        ).attributes.merge(test_email_id: 'test@example.com')
      }, format: :json
      smtp_setting.reload

      expect(smtp_setting.reload.password).to eq(old_password)
      expect(response.status).to eq(200)
    end

    it "doesn't updates smtp_setting if validation fails" do
      put :update, params: {
        client_id: client.id,
        id: smtp_setting.id,
        resource: build(:smtp_setting, enabled: true, host: 'gmail.com', port: '').attributes
      }, format: :json
      smtp_setting.reload

      parsed_response = response.parsed_body
      expected_response = { 'errors' => { 'port' => ["can't be blank"] } }
      expect(parsed_response).to eq(expected_response)
      expect(smtp_setting.host).to_not eq('gmail.com')
      expect(response.status).to eq(422)
    end
  end

  describe 'POST validate_settings' do
    it 'returns 200 response smtp_setting is valid' do
      build(:smtp_setting, enabled: true, host: 'gmail.com', port: '465').attributes
      post :validate_settings, params: {
        client_id: client.id,
        resource: build(:smtp_setting, enabled: true, host: 'gmail.com', port: '465').attributes
      }, format: :json

      expect(response.status).to eq(200)
      expect(response.body).to eq('')
    end

    it 'returns error ifsmtp_setting is not valid' do
      post :validate_settings, params: {
        client_id: client.id,
        resource: build(:smtp_setting, enabled: true, host: 'gmail.com', port: '').attributes
      }, format: :json

      parsed_response = response.parsed_body
      expected_response = { 'errors' => { 'port' => ["can't be blank"] } }
      expect(parsed_response).to eq(expected_response)
      expect(smtp_setting.host).to_not eq('gmail.com')
      expect(response.status).to eq(422)
    end
  end

  describe 'POST send_test_email' do
    it 'sends test email if to_email provided is valid' do
      expect(SmtpSettingMailer).to receive_message_chain(:test_email, :deliver_now!)

      post :send_test_email, params: {
        client_id: client.id,
        resource: build(:smtp_setting).attributes,
        to_email: 'james@cc.com'
      }, format: :json

      expect(response.status).to eq(200)
    end

    it "doesn't sends test email if to_email provided is invalid" do
      expect(SmtpSettingMailer).to_not receive(:test_email)

      post :send_test_email, params: {
        client_id: client.id,
        resource: build(:smtp_setting).attributes,
        to_email: 'abc'
      }, format: :json

      parsed_response = response.parsed_body
      expected_response = { 'errors' => ['Email is invalid'] }
      expect(parsed_response).to eq(expected_response)
      expect(response.status).to eq(422)
    end

    it 'rescues standard errors securely' do
      allow(SmtpSettingMailer).to receive(:test_email).and_raise(StandardError, 'Secret internal SQL err')

      post :send_test_email, params: {
        client_id: client.id,
        resource: build(:smtp_setting).attributes,
        to_email: 'james@cc.com'
      }, format: :json

      parsed_response = response.parsed_body
      expect(parsed_response['errors']).to eq(I18n.t('administration.smtp_settings.errors.general_failure',
                                                     default: 'Failed to connect. Please check your settings.'))
      expect(parsed_response['errors']).not_to include('SQL err')
      expect(response.status).to eq(422)
    end
  end
end
