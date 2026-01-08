# frozen_string_literal: true

require 'rails_helper'
require 'siem_logger/controller_helper'

RSpec.describe SiemLogger::ControllerHelper do
  let(:dummy_class) do
    Class.new do
      include SiemLogger::ControllerHelper

      attr_accessor :request

      def initialize(request)
        @request = request
      end
    end
  end

  let(:request) do
    instance_double(ActionDispatch::Request, remote_ip: '127.0.0.1', user_agent: 'RSpec Agent',
   env: { 'action_dispatch.request_id' => 'req-123' }, url: 'http://test.host')
  end
  let(:controller) { dummy_class.new(request) }
  let(:user_email) { 'test@example.com' }

  describe '#siem_log_authentication_success' do
    let(:user) { instance_double('User', email: user_email, id: 1) }

    it 'logs SAML success with identity provider' do
      expect(SiemLogger).to receive(:log_security_event!).with(
        'LoginSuccessful',
        hash_including(
          authentication_channel: 'SAML',
          request_details: hash_including(identity_provider: 'MMC-OKTA'),
          msg: 'SAML authentication successful'
        )
      )

      controller.siem_log_authentication_success(user, :saml, identity_provider: 'MMC-OKTA')
    end

    it 'logs SSO success with default identity provider' do
      expect(SiemLogger).to receive(:log_security_event!).with(
        'LoginSuccessful',
        hash_including(
          authentication_channel: 'API Based SSO',
          request_details: hash_including(identity_provider: ''),
          msg: 'API Based SSO authentication successful'
        )
      )

      controller.siem_log_authentication_success(user, :sso)
    end

    context 'when DONT_SEND_PI_TO_SIEM is true' do
      before do
        allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      end

      it 'uses user.id instead of user.email' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'LoginSuccessful',
          hash_including(
            actor_name: user.id.to_s,
            context: "User #{user.id} authenticated via SAML"
          )
        )

        controller.siem_log_authentication_success(user, :saml)
      end
    end
  end
end
