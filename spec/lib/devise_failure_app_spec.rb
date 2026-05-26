# frozen_string_literal: true

require 'rails_helper'

describe DeviseFailureApp do
  include Rails.application.routes.url_helpers

  describe '#redirect_url' do
    it 'returns warden_options[:attempted_path] if force_saml params is not true' do
      failure_app = DeviseFailureApp.new
      request = build_request(subdomain: 'sub1', params: {})
      allow(failure_app).to receive(:request).and_return(request)
      allow(failure_app).to receive(:warden_options).and_return(attempted_path: 'users/sign_in')
      project = create(:project, subdomain: 'sub1')
      create(:saml_setting, project: project, enabled: true, verified: true)
      result = failure_app.redirect_url

      expect(result).to eq('http://example.com/users/sign_in')
    end

    it 'returns warden_options[:attempted_path] if force_saml params is true but saml is not enabled' do
      failure_app = DeviseFailureApp.new
      request = build_request(subdomain: 'sub1', params: { force_saml: 'true' })
      allow(failure_app).to receive(:request).and_return(request)
      allow(failure_app).to receive(:warden_options).and_return(attempted_path: 'users/sign_in')
      project = create(:project, subdomain: 'sub1')
      create(:saml_setting, project: project, enabled: false)
      result = failure_app.redirect_url

      expect(result).to eq('http://example.com/users/sign_in')
    end

    it 'if force_saml params is true and saml is enabled it returns new_saml_user_session_path with return_url' do
      failure_app = DeviseFailureApp.new
      request = build_request(subdomain: 'sub1', params: { force_saml: 'true' })
      allow(failure_app).to receive(:request).and_return(request)
      allow(failure_app).to receive(:warden_options).and_return(attempted_path: 'users/sign_in')
      project = create(:project, subdomain: 'sub1')
      project.saml_setting.update(enabled: true, verified: true)
      result = failure_app.redirect_url

      expect(result).to eq(new_saml_user_session_path(return_url: 'users/sign_in'))
    end
  end

  private

  def build_request(params = {})
    # rubocop:disable Style/OpenStructUse
    env = {
      'REQUEST_URI' => 'http://example.com/',
      'HTTP_HOST' => 'example.com',
      'REQUEST_METHOD' => 'GET',
      'warden.options' => { scope: :user },
      'rack.input' => '',
      'warden' => OpenStruct.new(message: nil)
    }
    # rubocop:enable all
    request = ActionDispatch::Request.new(env)
    params.each do |method, value|
      allow(request).to receive(method).and_return(value)
    end
    request
  end
end
