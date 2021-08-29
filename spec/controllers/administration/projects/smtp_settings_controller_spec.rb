# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Projects::SmtpSettingsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:smtp_setting) { project.smtp_setting }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'PUT update' do
    it 'updates smtp_setting if params are valid' do
      build(:smtp_setting, enabled: true, host: 'gmail.com', port: '465').attributes
      get :update, params: {
        project_id: project.id,
        id: smtp_setting.id,
        resource: build(:smtp_setting, enabled: true, host: 'gmail.com', port: '465').attributes
      }, format: :json
      smtp_setting.reload

      parsed_response = JSON.parse(response.body)
      expected_response = smtp_setting.slice(
        :id, :authentication_type, :enabled, :encryption, :from_name, :from_email,
        :host, :user_name, :password, :port
      )
      expect(parsed_response).to eq(expected_response)
      expect(smtp_setting.host).to eq('gmail.com')
      expect(smtp_setting.port).to eq(465)
      expect(response.status).to eq(200)
    end

    it "doesn't updates smtp_setting if validation fails" do
      get :update, params: {
        project_id: project.id,
        id: smtp_setting.id,
        resource: build(:smtp_setting, enabled: true, host: 'gmail.com', port: '').attributes
      }, format: :json
      smtp_setting.reload

      parsed_response = JSON.parse(response.body)
      expected_response = { 'errors' => { 'port' => ["can't be blank"] } }
      expect(parsed_response).to eq(expected_response)
      expect(smtp_setting.host).to_not eq('gmail.com')
      expect(response.status).to eq(422)
    end
  end

  describe 'PUT update' do
    it 'sends test email if to_email provided is valid' do
      expect(SmtpSettingMailer).to receive_message_chain(:test_email, :deliver_later)

      post :send_test_email, params: {
        project_id: project.id,
        id: smtp_setting.id,
        to_email: 'james@cc.com'
      }, format: :json

      expect(response.status).to eq(200)
    end

    it "doesn't sends test email if to_email provided is invalid" do
      expect(SmtpSettingMailer).to_not receive(:test_email)

      post :send_test_email, params: {
        project_id: project.id,
        id: smtp_setting.id,
        to_email: 'abc'
      }, format: :json

      parsed_response = JSON.parse(response.body)
      expected_response = { 'errors' => { 'to_email' => ['Email is invalid'] } }
      expect(parsed_response).to eq(expected_response)
      expect(response.status).to eq(422)
    end
  end
end
