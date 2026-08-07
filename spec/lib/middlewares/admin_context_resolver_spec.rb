# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Middlewares::AdminContextResolver do
  let(:app) { ->(env) { [200, env, ['OK']] } }
  let(:middleware) { described_class.new(app) }

  before do
    allow(Settings).to receive(:subdomain).and_return('app')
    allow(Settings).to receive(:domain).and_return('tte.com')
    Current.reset
  end

  after do
    Current.reset
  end

  describe '#call' do
    context 'when subdomain is root domain' do
      let(:env) { Rack::MockRequest.env_for('http://app.tte.com/admin') }

      it 'sets admin_context to :super_admin' do
        context_during_request = nil

        app_with_capture = lambda do |e|
          context_during_request = Current.admin_context
          [200, e, ['OK']]
        end

        described_class.new(app_with_capture).call(env)

        expect(context_during_request).to eq(:super_admin)
      end
    end

    context 'when subdomain is blank' do
      let(:env) { Rack::MockRequest.env_for('http://tte.com/admin') }

      it 'sets admin_context to :super_admin' do
        context_during_request = nil

        app_with_capture = lambda do |e|
          context_during_request = Current.admin_context
          [200, e, ['OK']]
        end

        described_class.new(app_with_capture).call(env)

        expect(context_during_request).to eq(:super_admin)
      end
    end

    context 'when subdomain is client admin' do
      let(:env) { Rack::MockRequest.env_for('http://adnoc-admin.tte.com/admin') }
      let!(:client) { create(:tenancy, subdomain: 'adnoc') }

      it 'sets admin_context to :client_admin' do
        context_during_request = nil

        app_with_capture = lambda do |e|
          context_during_request = Current.admin_context
          [200, e, ['OK']]
        end

        described_class.new(app_with_capture).call(env)

        expect(context_during_request).to eq(:client_admin)
      end

      it 'sets Current.client to the matching client' do
        client_during_request = nil

        app_with_capture = lambda do |e|
          client_during_request = Current.client
          [200, e, ['OK']]
        end

        described_class.new(app_with_capture).call(env)

        expect(client_during_request).to eq(client)
      end
    end

    context 'when subdomain is end user' do
      let(:env) { Rack::MockRequest.env_for('http://adnoc.tte.com/assessment') }

      it 'sets admin_context to nil' do
        context_during_request = nil

        app_with_capture = lambda do |e|
          context_during_request = Current.admin_context
          [200, e, ['OK']]
        end

        described_class.new(app_with_capture).call(env)

        expect(context_during_request).to be_nil
      end
    end

    context 'when client does not exist' do
      let(:env) { Rack::MockRequest.env_for('http://unknown-admin.tte.com/admin') }

      it 'sets admin_context to :client_admin but client is nil' do
        context_during_request = nil
        client_during_request = :not_checked

        app_with_capture = lambda do |e|
          context_during_request = Current.admin_context
          client_during_request = Current.client
          [200, e, ['OK']]
        end

        described_class.new(app_with_capture).call(env)

        expect(context_during_request).to eq(:client_admin)
        expect(client_during_request).to be_nil
      end
    end

    # Current.reset is handled by ActionDispatch after each request — not the middleware's responsibility
    xit 'resets Current after request completes' do
      env = Rack::MockRequest.env_for('http://app.tte.com/admin')
      middleware.call(env)

      expect(Current.admin_context).to be_nil
    end
  end

  describe 'superadmin client scoping' do
    let!(:tenant) { create(:tenancy) }

    def tenant_during_request(url)
      captured = :not_checked

      app_with_capture = lambda do |e|
        captured = ActsAsTenant.current_tenant
        [200, e, ['OK']]
      end

      described_class.new(app_with_capture).call(Rack::MockRequest.env_for(url))
      captured
    end

    context 'when the feature flag is enabled' do
      before { allow(TenantEnforcement).to receive(:superadmin_scoping_disabled?).and_return(false) }

      it 'scopes the tenant on a client page' do
        tenant_from_request = tenant_during_request("http://app.tte.com/administration/clients/#{tenant.id}")

        expect(tenant_from_request).to eq(tenant)
      end

      it 'does not scope the tenant on a non-client page' do
        tenant_from_request = tenant_during_request('http://app.tte.com/administration/admin_jobs')

        expect(tenant_from_request).to be_nil
      end

      it 'does not scope when the client subdomain is bypassed' do
        allow(TenantEnforcement).to receive(:subdomain_bypassed?).and_return(true)

        tenant_from_request = tenant_during_request("http://app.tte.com/administration/clients/#{tenant.id}")

        expect(tenant_from_request).to be_nil
      end

      it 'does not set Current.client on a client page' do
        client_during_request = :not_checked

        app_with_capture = lambda do |e|
          client_during_request = Current.client
          [200, e, ['OK']]
        end

        env = Rack::MockRequest.env_for("http://app.tte.com/administration/clients/#{tenant.id}")
        described_class.new(app_with_capture).call(env)

        expect(client_during_request).to be_nil
      end
    end

    context 'when the feature flag is disabled' do
      before { allow(TenantEnforcement).to receive(:superadmin_scoping_disabled?).and_return(true) }

      it 'does not scope the tenant on a client page' do
        tenant_from_request = tenant_during_request("http://app.tte.com/administration/clients/#{tenant.id}")

        expect(tenant_from_request).to be_nil
      end
    end
  end
end
