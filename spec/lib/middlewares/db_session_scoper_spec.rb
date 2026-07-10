# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Middlewares::DbSessionScoper do
  let(:app) { ->(env) { [200, env, 'app'] } }
  let(:middleware) { described_class.new(app, options) }
  let(:default_store) { middleware.instance_variable_get(:@default_store) }

  before { RequestStore.clear! }

  context 'on a real domain (e.g. ttedev.me)' do
    let(:options) { { key: '_psychometrics_session', tld_length: 2, same_site: 'Lax', secure: false } }

    before { allow(Settings).to receive(:domain).and_return('ttedev.me') }

    context 'when subdomain is a client admin subdomain' do
      let(:env) { Rack::MockRequest.env_for('http://adnoc-admin.ttedev.me') }

      it 'uses a per-client admin session store instead of the default' do
        expect(default_store).not_to receive(:call)

        allow(ActionDispatch::Session::ActiveRecordStore).to receive(:new).and_call_original
        middleware.call(env)

        expect(ActionDispatch::Session::ActiveRecordStore).to have_received(:new).with(
          app, hash_including(key: '_psychometrics_adnoc_admin_session')
        )
      end

      it 'stores client admin subdomain in RequestStore' do
        middleware.call(env)

        expect(RequestStore.store[:client_admin_subdomain]).to eq('adnoc')
      end
    end

    context 'when two different client admin subdomains' do
      let(:env_a) { Rack::MockRequest.env_for('http://saib22-admin.ttedev.me') }
      let(:env_b) { Rack::MockRequest.env_for('http://ps-gauri-admin.ttedev.me') }

      it 'builds separate session stores for each' do
        allow(ActionDispatch::Session::ActiveRecordStore).to receive(:new).and_call_original

        middleware.call(env_a)
        middleware.call(env_b)

        expect(ActionDispatch::Session::ActiveRecordStore).to have_received(:new).with(
          app, hash_including(key: '_psychometrics_saib22_admin_session')
        )
        expect(ActionDispatch::Session::ActiveRecordStore).to have_received(:new).with(
          app, hash_including(key: '_psychometrics_ps-gauri_admin_session')
        )
      end
    end

    context 'when subdomain is an end-user subdomain' do
      let(:env) { Rack::MockRequest.env_for('http://adnoc.ttedev.me') }

      it 'uses the default session store' do
        expect(default_store).to receive(:call).with(env).and_return([200, env, 'app'])
        middleware.call(env)
      end

      it 'does not store client admin subdomain in RequestStore' do
        allow(default_store).to receive(:call).with(env).and_return([200, env, 'app'])
        middleware.call(env)

        expect(RequestStore.store[:client_admin_subdomain]).to be_nil
      end
    end

    context 'when subdomain is empty (root domain)' do
      let(:env) { Rack::MockRequest.env_for('http://ttedev.me') }

      it 'uses the default session store' do
        expect(default_store).to receive(:call).with(env).and_return([200, env, 'app'])
        middleware.call(env)
      end
    end

    context 'when subdomain is the app subdomain' do
      let(:env) { Rack::MockRequest.env_for("http://#{Settings.subdomain}.ttedev.me") }

      it 'uses the default session store' do
        expect(default_store).to receive(:call).with(env).and_return([200, env, 'app'])
        middleware.call(env)
      end
    end
  end

  context 'on localhost' do
    let(:options) { { key: '_psychometrics_session', tld_length: 0, same_site: 'Lax', secure: false } }

    before { allow(Settings).to receive(:domain).and_return('localhost') }

    context 'when subdomain is a client admin subdomain' do
      let(:env) { Rack::MockRequest.env_for('http://adnoc-admin.localhost') }

      it 'uses a per-client admin session store instead of the default' do
        expect(default_store).not_to receive(:call)

        allow(ActionDispatch::Session::ActiveRecordStore).to receive(:new).and_call_original
        middleware.call(env)

        expect(ActionDispatch::Session::ActiveRecordStore).to have_received(:new).with(
          app, hash_including(key: '_psychometrics_adnoc_admin_session')
        )
      end

      it 'stores client admin subdomain in RequestStore' do
        middleware.call(env)

        expect(RequestStore.store[:client_admin_subdomain]).to eq('adnoc')
      end
    end

    context 'when subdomain is an end-user subdomain' do
      let(:env) { Rack::MockRequest.env_for('http://adnoc.localhost') }

      it 'uses the default session store' do
        expect(default_store).to receive(:call).with(env).and_return([200, env, 'app'])
        middleware.call(env)
      end
    end

    context 'when subdomain is empty (root domain)' do
      let(:env) { Rack::MockRequest.env_for('http://localhost') }

      it 'uses the default session store' do
        expect(default_store).to receive(:call).with(env).and_return([200, env, 'app'])
        middleware.call(env)
      end
    end
  end
end
