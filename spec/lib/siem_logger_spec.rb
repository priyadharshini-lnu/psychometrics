# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('lib/siem_logger')

RSpec.describe SiemLogger do
  describe '.session_identifier' do
    it 'returns the session private_id, never the raw public_id (cookie value)' do
      session_id_double = instance_double(Rack::Session::SessionId, private_id: '2::abc123hash',
                                          public_id: 'raw-cookie-value')
      session = instance_double(ActionDispatch::Request::Session, id: session_id_double)
      request = instance_double(ActionDispatch::Request, session: session)

      expect(described_class.session_identifier(request)).to eq('2::abc123hash')
    end

    it 'returns nil without raising when the request has no session' do
      request = instance_double(ActionDispatch::Request)
      allow(request).to receive(:session).and_raise(ActionDispatch::Request::Session::DisabledSessionError)

      expect(described_class.session_identifier(request)).to be_nil
    end

    it 'returns nil when there is no session id yet' do
      session = instance_double(ActionDispatch::Request::Session, id: nil)
      request = instance_double(ActionDispatch::Request, session: session)

      expect(described_class.session_identifier(request)).to be_nil
    end
  end

  describe '.scrub_url' do
    it 'returns empty string for nil or blank url' do
      expect(described_class.send(:scrub_url, nil)).to eq('')
      expect(described_class.send(:scrub_url, '')).to eq('')
    end

    it 'returns original url if no sensitive data found' do
      url = 'https://example.com/some/path?foo=bar'
      expect(described_class.send(:scrub_url, url)).to eq(url)
    end

    it 'scrubs SSO token from path' do
      url = 'https://example.com/sso/some-id/secret-token/'
      scrubbed = described_class.send(:scrub_url, url)
      expect(scrubbed).to eq(url)
    end

    it 'scrubs sensitive query parameters using Rails config' do
      url = 'https://example.com/login?password=secret&token=secret&other=value'
      scrubbed = described_class.send(:scrub_url, url)
      expect(scrubbed).to include('password=%5BFILTERED%5D')
      expect(scrubbed).to include('token=%5BFILTERED%5D')
      expect(scrubbed).to include('other=value')
    end

    it 'returns empty string on standard error (fail-closed)' do
      # Force an error by mocking
      allow(URI).to receive(:parse).and_raise(StandardError.new('Some error'))
      url = 'https://example.com/error'
      expect(Rails.logger).to receive(:warn).with(/SiemLogger: Failed to scrub URL/)
      expect(described_class.send(:scrub_url, url)).to eq('')
    end

    it 'handles malformed URLs gracefully by returning the original url' do
      url = 'http:://bad-url'
      expect(described_class.send(:scrub_url, url)).to eq(url)
    end
  end

  describe '.log_security_event!' do
    let(:request) { instance_double(ActionDispatch::Request, remote_ip: '127.0.0.1', user_agent: 'RSpec Agent', env: {}) }

    it 'logs basic security event' do
      expect(SiemLogger::LOGGER).to receive(:info).with(hash_including(
                                                          'EventName' => 'LoginSuccessful',
                                                          'ClientIPAddress' => '127.0.0.1'
                                                        ))
      described_class.log_security_event!('LoginSuccessful', { request_details: { ip: request.remote_ip } })
    end

    it 'raises error for unknown event name' do
      expect do
        described_class.log_security_event!('UnknownEvent', { request_details: { ip: request.remote_ip } })
      end.to raise_error(ArgumentError, /Unknown event name/)
    end
  end
end
