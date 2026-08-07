# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::SessionRegistry do
  let(:user) { create(:client_admin) }
  let(:client) { user.memberships.first.client }

  describe '.register' do
    let(:client) { create(:tenancy) }
    let(:session_hash) { {} }

    it 'writes client_id into the session hash' do
      described_class.register(session_hash, client: client)

      expect(session_hash[:client_id]).to eq(client.id)
    end

    it 'sets impersonated_by_id to nil by default' do
      described_class.register(session_hash, client: client)

      expect(session_hash[:impersonated_by_id]).to be_nil
    end

    it 'writes impersonated_by_id when provided' do
      described_class.register(session_hash, client: client, impersonated_by_id: 42)

      expect(session_hash[:impersonated_by_id]).to eq(42)
    end
  end

  describe '.active_client_ids' do
    it 'returns client ids with active real sessions' do
      create(:session, user: user, client: client, impersonator: nil)

      expect(described_class.active_client_ids(user)).to include(client.id)
    end

    it 'excludes stale sessions' do
      session = create(:session, user: user, client: client, impersonator: nil)
      session.update_columns(updated_at: 25.hours.ago)

      expect(described_class.active_client_ids(user)).to be_empty
    end

    it 'excludes impersonated sessions' do
      impersonator = create(:superadmin)
      create(:session, user: user, client: client, impersonator: impersonator)

      expect(described_class.active_client_ids(user)).to be_empty
    end
  end

  describe '.recent_client_ids' do
    it 'returns the most recently active client ids' do
      client1 = create(:tenancy)
      client2 = create(:tenancy)
      session1 = create(:session, user: user, client: client1, impersonator: nil)
      session2 = create(:session, user: user, client: client2, impersonator: nil)
      session1.update_columns(updated_at: 10.minutes.ago)
      session2.update_columns(updated_at: 1.minute.ago)

      recent = described_class.recent_client_ids(user)
      expect(recent).to eq([client2.id, client1.id])
    end

    it 'respects the limit' do
      3.times { create(:session, user: user, client: create(:tenancy), impersonator: nil) }
      expect(described_class.recent_client_ids(user, limit: 2).size).to eq(2)
    end
  end

  describe '.invalidate_all_real' do
    it 'removes all real sessions for the user' do
      other_client = create(:tenancy)
      create(:session, user: user, client: client, impersonator: nil)
      create(:session, user: user, client: other_client, impersonator: nil)

      expect { described_class.invalidate_all_real(user) }.
        to change(Session, :count).by(-2)
    end

    it 'does not remove impersonated sessions' do
      impersonator = create(:superadmin)
      create(:session, user: user, client: client, impersonator: impersonator)

      described_class.invalidate_all_real(user)

      expect(Session.where(user_id: user.id, impersonator_id: impersonator.id)).to exist
    end
  end

  describe '.invalidate_all_impersonated' do
    let(:impersonator) { create(:superadmin) }

    it 'removes all impersonated sessions for the user by the impersonator' do
      create(:session, user: user, client: client, impersonator: impersonator)

      expect { described_class.invalidate_all_impersonated(user, impersonator: impersonator) }.
        to change(Session, :count).by(-1)
    end

    it 'does not remove real sessions' do
      create(:session, user: user, client: client, impersonator: nil)
      create(:session, user: user, client: client, impersonator: impersonator)

      described_class.invalidate_all_impersonated(user, impersonator: impersonator)

      expect(Session.real.where(user_id: user.id)).to exist
    end
  end

  describe '.session_active?' do
    let(:impersonator) { create(:superadmin) }

    it 'returns true when an active impersonated session exists' do
      create(:session, user: user, client: client, impersonator: impersonator)

      expect(described_class.session_active?(user, client, impersonator: impersonator)).to be true
    end

    it 'returns false when no impersonated session exists' do
      expect(described_class.session_active?(user, client, impersonator: impersonator)).to be false
    end

    it 'returns false when the session is stale' do
      session = create(:session, user: user, client: client, impersonator: impersonator)
      session.update_columns(updated_at: 25.hours.ago)

      expect(described_class.session_active?(user, client, impersonator: impersonator)).to be false
    end
  end
end
