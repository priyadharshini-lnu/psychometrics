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

      def current_user; end
    end
  end

  let(:request) do
    instance_double(ActionDispatch::Request, remote_ip: '127.0.0.1', user_agent: 'RSpec Agent',
    env: { 'action_dispatch.request_id' => 'req-123' }, url: 'http://test.host')
  end
  let(:controller) { dummy_class.new(request) }
  let(:user_email) { 'test@example.com' }
  let(:user) { instance_double('User', email: user_email, id: 1) }

  before do
    allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(false)
  end

  describe '#siem_log_authentication_success' do
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

  describe '#siem_log_impersonation_event' do
    let(:target_user) { instance_double('User', email: 'target@example.com', id: 2, project_id: nil) }
    let(:current_user) { user }

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
  describe '#siem_log_token_issuance' do
    let(:context_msg) { 'Test context' }

    it 'logs TokenIssuance event' do
      expect(SiemLogger).to receive(:log_security_event!).with(
        'TokenIssuance',
        hash_including(
          actor_name: user_email,
          context: context_msg,
          msg: "TestChannel token issued for #{user_email}",
          authentication_channel: 'TestChannel',
          request_details: hash_including(identity_provider: 'TestProvider'),
          session_id: 1
        )
      )

      controller.siem_log_token_issuance(user, 'TestChannel', context: context_msg, identity_provider: 'TestProvider')
    end

    context 'when DONT_SEND_PI_TO_SIEM is true' do
      before do
        allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      end

      it 'uses user ids instead of emails for the actor' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'TokenIssuance',
          hash_including(
            actor_name: '1',
            msg: 'TestChannel token issued for 1'
          )
        )

        controller.siem_log_token_issuance(user, 'TestChannel', context: context_msg)
      end
    end
  end
  describe '#siem_log_authorization_failure' do
    let(:resource) { 'TestResource' }
    let(:action) { 'test_action' }

    context 'when user is authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(user)
      end

      it 'logs AuthorizationFailure event' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'AuthorizationFailure',
          hash_including(
            context: "Authorization failed for #{user_email}",
            msg: "User #{user_email} was denied access to TestResource (Action: test_action)",
            actor_name: user_email,
            session_id: 1,
            request_details: hash_including(
              resource_type: resource,
              action: action
            ),
            tags: %w[authorization_failure security_event]
          )
        )

        controller.siem_log_authorization_failure(resource: resource, action: action)
      end
    end

    context 'when action is not provided' do
      before do
        allow(controller).to receive(:current_user).and_return(user)
      end

      it 'logs AuthorizationFailure event without action suffix' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'AuthorizationFailure',
          hash_including(
            msg: "User #{user_email} was denied access to #{resource}",
            request_details: hash_including(
              resource_type: resource,
              action: nil
            ),
            tags: %w[authorization_failure security_event]
          )
        )

        controller.siem_log_authorization_failure(resource: resource, action: nil)
      end
    end

    context 'when resource is a Class' do
      let(:resource_class) { String }

      before do
        allow(controller).to receive(:current_user).and_return(user)
      end

      it 'correctly extracts the resource name' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'AuthorizationFailure',
          hash_including(
            msg: "User #{user_email} was denied access to String (Action: #{action})",
            request_details: hash_including(
              resource_type: 'String'
            )
          )
        )

        controller.siem_log_authorization_failure(resource: resource_class, action: action)
      end
    end

    context 'when user is not authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(nil)
      end

      it 'logs AuthorizationFailure event with Unknown actor' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'AuthorizationFailure',
          hash_including(
            context: 'Authorization failed for Unknown',
            msg: 'User Unknown was denied access to TestResource (Action: test_action)',
            actor_name: 'Unknown',
            session_id: nil,
            tags: %w[authorization_failure security_event]
          )
        )

        controller.siem_log_authorization_failure(resource: resource, action: action)
      end
    end

    context 'when user is explicitly passed' do
      it 'logs AuthorizationFailure event using passed user' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'AuthorizationFailure',
          hash_including(
            context: "Authorization failed for #{user_email}",
            actor_name: user_email,
            session_id: 1,
            tags: %w[authorization_failure security_event]
          )
        )

        controller.siem_log_authorization_failure(resource: resource, action: action, user: user)
      end
    end
  end

  describe '#siem_log_session_management_exception' do
    let(:exception) { StandardError.new('Invalid token') }

    context 'when user is authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(user)
      end

      it 'logs SessionManagementExceptions event' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'SessionManagementExceptions',
          hash_including(
            context: "Session verification failed for #{user_email}",
            msg: 'SessionManagementException: Invalid token',
            actor_name: user_email,
            session_id: 1,
            request_details: hash_including(
              exception_class: 'StandardError'
            )
          )
        )

        controller.siem_log_session_management_exception(exception)
      end
    end

    context 'when user is not authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(nil)
      end

      it 'logs SessionManagementExceptions event with Unknown actor' do
        expect(SiemLogger).to receive(:log_security_event!).with(
          'SessionManagementExceptions',
          hash_including(
            context: 'Session verification failed for Unknown',
            msg: 'SessionManagementException: Invalid token',
            actor_name: 'Unknown',
            session_id: nil,
            request_details: hash_including(
              exception_class: 'StandardError'
            )
          )
        )

        controller.siem_log_session_management_exception(exception)
      end
    end
  end
end
