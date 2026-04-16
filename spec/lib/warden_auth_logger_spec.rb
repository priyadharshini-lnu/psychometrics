# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WardenAuthLogger do
  let(:user) { create(:user) }
  let(:project) { user.project }
  let(:request_id) { SecureRandom.uuid }

  before do
    allow(AuditLogModule).to receive(:audit!)
    allow(SiemLogger).to receive(:log_security_event!)
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
  end

  def build_env(params: {}, remote_ip: '127.0.0.1', user_agent: 'RSpec', host: 'test.host', extras: {})
    env = Rack::MockRequest.env_for('http://test.host/', method: 'POST', params: params)
    env['REMOTE_ADDR'] = remote_ip
    env['HTTP_USER_AGENT'] = user_agent
    env['HTTP_HOST'] = host
    env['action_dispatch.request_id'] = request_id
    env.merge!(extras)
    env
  end

  def build_action_dispatch_request(params: {})
    env = build_env(params: params)
    env['rack.session'] = {}
    ActionDispatch::Request.new(env)
  end

  describe '.log_failure' do
    context 'when email is blank' do
      it 'does not log audit' do
        env = build_env(params: { 'user' => { 'email' => '' } })

        described_class.log_failure(env, { message: :invalid })

        expect(AuditLogModule).not_to have_received(:audit!)
      end
    end

    context 'when SSO is present' do
      it 'returns early without logging' do
        env = build_env(
          params: { 'user' => { 'email' => user.email } },
          extras: { sso: { user_id: user.id } }
        )

        described_class.log_failure(env, { message: :invalid })

        expect(AuditLogModule).not_to have_received(:audit!)
      end
    end

    context 'with password login failure' do
      it 'logs as sign_in action' do
        env = build_env(params: { 'user' => { 'email' => user.email } })

        described_class.log_failure(env, { message: :invalid })

        expect(AuditLogModule).to have_received(:audit!).with(
          :sign_in, nil,
          hash_including(outcome: 'failed', failure_reason: 'devise.invalid')
        )
        expect(SiemLogger).to have_received(:log_security_event!).with(
          'LoginFailure',
          hash_including(authentication_channel: 'Password Login')
        )
      end
    end

    context 'with SAML failure (SAMLResponse in params)' do
      it 'logs as saml_login action' do
        env = build_env(params: {
          'user' => { 'email' => user.email },
          'SAMLResponse' => 'base64encodedresponse'
        })

        described_class.log_failure(env, { message: :invalid })

        expect(AuditLogModule).to have_received(:audit!).with(
          :saml_login, nil,
          hash_including(outcome: 'failed')
        )
        expect(SiemLogger).to have_received(:log_security_event!).with(
          'LoginFailure',
          hash_including(authentication_channel: 'SAML')
        )
      end
    end
  end

  describe '.log_success' do
    let(:ad_request) { build_action_dispatch_request }
    let(:winning_strategies) { {} }

    let(:auth) do
      instance_double(Warden::Proxy, request: ad_request, winning_strategies: winning_strategies)
    end

    context 'with password login' do
      let(:winning_strategies) { { user: Devise::Strategies::DatabaseAuthenticatable.new(nil) } }

      it 'logs audit and SIEM as sign_in' do
        described_class.log_success(user, auth, scope: :user)

        expect(AuditLogModule).to have_received(:audit!).with(
          :sign_in, user,
          hash_including(outcome: 'successful', user: user)
        )
        expect(SiemLogger).to have_received(:log_security_event!).with(
          'LoginSuccessful',
          hash_including(authentication_channel: 'Password Login')
        )
      end
    end

    context 'with SAML login' do
      let(:winning_strategies) { { user: Devise::Strategies::SamlAuthenticatable.new(nil) } }

      it 'skips AuditLogModule and logs SIEM as SAML' do
        described_class.log_success(user, auth, scope: :user)

        expect(AuditLogModule).not_to have_received(:audit!)
        expect(SiemLogger).to have_received(:log_security_event!).with(
          'LoginSuccessful',
          hash_including(authentication_channel: 'SAML')
        )
      end
    end
  end
end
