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

  describe '#siem_log_sensitive_operation' do
    before do
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(false)
      allow(controller).to receive(:current_user).and_return(user)
    end

    it 'logs a SensitiveOperation event with correct parameters' do
      expect(SiemLogger).to receive(:log_security_event!).with(
        'SensitiveOperation',
        hash_including(
          context: "Test Context by #{user_email}",
          msg: "User #{user_email} performed action",
          actor_name: user_email,
          session_id: 1,
          request_details: hash_including(
            action_type: 'Test Action',
            resource: 'Test Resource'
          )
        )
      )

      controller.siem_log_sensitive_operation(
        context: 'Test Context',
        action_description: 'performed action',
        action_type: 'Test Action',
        resource: 'Test Resource'
      )
    end

    it 'handles optional resource parameter' do
      expect(SiemLogger).to receive(:log_security_event!).with(
        'SensitiveOperation',
        hash_including(
          request_details: hash_including(
            resource: nil
          )
        )
      )

      controller.siem_log_sensitive_operation(
        context: 'Test Context',
        action_description: 'performed action',
        action_type: 'Test Action'
      )
    end

    it 'logs as System if no current_user' do
      allow(controller).to receive(:current_user).and_return(nil)

      expect(SiemLogger).to receive(:log_security_event!).with(
        'SensitiveOperation',
        hash_including(
          context: 'Test Context by System',
          msg: 'User System performed action',
          actor_name: 'System',
          session_id: nil
        )
      )

      controller.siem_log_sensitive_operation(
        context: 'Test Context',
        action_description: 'performed action',
        action_type: 'Test Action'
      )
    end
  end
end
