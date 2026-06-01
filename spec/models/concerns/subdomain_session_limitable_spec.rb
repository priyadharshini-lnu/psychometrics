# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SubdomainSessionLimitable do
  let(:user) { create(:superadmin) }
  let(:client) { create(:tenancy) }

  after do
    Current.reset
    $redis.keys("session_limitable:#{user.id}:*").each { |key| $redis.del(key) }
  end

  describe '#skip_session_limitable?' do
    context 'when feature flag is enabled' do
      before { allow(Settings.features).to receive(:skip_session_limitable).and_return(true) }

      it 'returns true' do
        expect(user.skip_session_limitable?).to be true
      end
    end

    context 'when feature flag is disabled' do
      before { allow(Settings.features).to receive(:skip_session_limitable).and_return(false) }

      it 'returns false' do
        expect(user.skip_session_limitable?).to be false
      end
    end
  end

  describe '#update_unique_session_id!' do
    context 'on client admin subdomain' do
      before do
        Current.client = client
        Current.admin_context = :client_admin
        ActsAsTenant.current_tenant = client
      end

      it 'stores token in Redis for user and client' do
        user.update_unique_session_id!('new-token')

        expect($redis.get("session_limitable:#{user.id}:#{client.id}")).to eq('new-token')
      end

      it 'stores token with expiry' do
        user.update_unique_session_id!('new-token')

        ttl = $redis.ttl("session_limitable:#{user.id}:#{client.id}")
        expect(ttl).to be_between(1, 24.hours.to_i)
      end

      it 'does not update tokens for other clients' do
        other_client = ActsAsTenant.without_tenant { create(:tenancy) }
        Current.client = client
        user.update_unique_session_id!('token-1')

        Current.client = other_client
        user.update_unique_session_id!('token-2')

        expect($redis.get("session_limitable:#{user.id}:#{client.id}")).to eq('token-1')
        expect($redis.get("session_limitable:#{user.id}:#{other_client.id}")).to eq('token-2')
      end

      it 'does not update the users.unique_session_id column' do
        user.update_attribute(:unique_session_id, 'old-token')

        user.update_unique_session_id!('new-token')

        user.reload
        expect(user[:unique_session_id]).to eq('old-token')
      end
    end

    context 'on root domain (super admin)' do
      before { Current.admin_context = :super_admin }

      it 'updates the users.unique_session_id column' do
        user.update_unique_session_id!('new-token')

        user.reload
        expect(user.unique_session_id).to eq('new-token')
      end
    end
  end

  describe '#unique_session_id' do
    context 'on client admin subdomain' do
      before do
        Current.client = client
        Current.admin_context = :client_admin
        ActsAsTenant.current_tenant = client
      end

      it 'returns the token from Redis' do
        $redis.set("session_limitable:#{user.id}:#{client.id}", 'stored-token')

        expect(user.unique_session_id).to eq('stored-token')
      end

      it 'returns nil when no token exists' do
        expect(user.unique_session_id).to be_nil
      end
    end

    context 'on root domain (super admin)' do
      before { Current.admin_context = :super_admin }

      it 'returns the users.unique_session_id column' do
        user.update_attribute(:unique_session_id, 'user-token')

        expect(user.unique_session_id).to eq('user-token')
      end
    end
  end
end
