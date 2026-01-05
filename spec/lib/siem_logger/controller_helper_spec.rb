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

    describe '#siem_log_impersonation_event' do
      let(:target_user) { instance_double('User', email: 'target@example.com', id: 2, project_id: nil) }
      let(:current_user) { instance_double('User', email: user_email, id: 1) }

      it 'logs Impersonation event' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'Impersonation',
          hash_including(
            actor_name: user_email,
            context: 'Admin logged in as Admin',
            msg: "Admin #{user_email} Logged in as Admin target@example.com",
            acting_as_user: 'target@example.com',
            session_id: 2
          )
        )

        controller.siem_log_impersonation_event(target_user, current_user, 'Admin')
      end

      it 'logs Impersonation event for user with project_id' do
        allow(target_user).to receive(:project_id).and_return(123)
        expect(SiemLogger).to receive(:log_security_event!).with(
          'Impersonation',
          hash_including(
            actor_name: user_email,
            context: 'Admin logged in as End User',
            msg: "Admin #{user_email} Logged in as End User target@example.com #123",
            acting_as_user: 'target@example.com',
            session_id: 2
          )
        )

        controller.siem_log_impersonation_event(target_user, current_user, 'End User')
      end

      context 'when DONT_SEND_PI_TO_SIEM is true' do
        before do
          allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
        end

        it 'uses user ids instead of emails for the actor and target' do
          expect(SiemLogger).to receive(:log_security_event!).with(
            'Impersonation',
            hash_including(
              actor_name: '1',
              context: 'Admin logged in as Admin',
              msg: 'Admin 1 Logged in as Admin 2',
              acting_as_user: '2',
              session_id: 2
            )
          )

          controller.siem_log_impersonation_event(target_user, current_user, 'Admin')
        end
      end
    end
  end
end
