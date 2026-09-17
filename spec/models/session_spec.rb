# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Session do
  let(:user) { create(:superadmin) }
  let(:client) { create(:tenancy) }

  describe '.cleanup_old_sessions' do
    it 'deletes sessions older than the specified time' do
      old_client = create(:tenancy)
      recent_client = create(:tenancy)
      old_session = create(:session, user: user, client: old_client, updated_at: 31.days.ago)
      recent_session = create(:session, user: user, client: recent_client, updated_at: 1.day.ago)

      expect { described_class.cleanup_old_sessions(older_than: 30.days.ago) }.
        to change(described_class, :count).by(-1)

      expect(described_class.exists?(old_session.id)).to be false
      expect(described_class.exists?(recent_session.id)).to be true
    end
  end

  describe 'session invalidation on logout' do
    let(:second_client) { create(:tenancy) }
    let(:impersonator) { create(:superadmin) }

    it 'invalidate_all_real deletes all real sessions for the user' do
      create(:session, user: user, client: client)
      create(:session, user: user, client: second_client)

      expect { AdminAuth::SessionRegistry.invalidate_all_real(user) }.
        to change { Session.real.where(user_id: user.id).count }.from(2).to(0)
    end

    it 'invalidate_all_real does not delete impersonated sessions' do
      create(:session, user: user, client: client, impersonator: impersonator)

      expect { AdminAuth::SessionRegistry.invalidate_all_real(user) }.
        not_to(change { Session.impersonated.where(user_id: user.id).count })
    end

    it 'invalidate_all_impersonated deletes only impersonated sessions for the given impersonator' do
      create(:session, user: user, client: client, impersonator: impersonator)
      real_session = create(:session, user: user, client: second_client)

      expect { AdminAuth::SessionRegistry.invalidate_all_impersonated(user, impersonator: impersonator) }.
        to change { Session.impersonated.where(user_id: user.id).count }.from(1).to(0)

      expect(Session.exists?(real_session.id)).to be true
    end

    it 'replaying a deleted session_id returns no data' do
      session = create(:session, user: user, client: client)
      session_id = session.session_id

      AdminAuth::SessionRegistry.invalidate_all_real(user)

      expect(Session.find_by(session_id: session_id)).to be_nil
    end
  end

  # Reproduces the Devise idle-clock persistence regression: write_session short-circuits
  # on record.changed?, so data= must dirty the row when the mutated hash differs from
  # what is persisted.
  describe 'in-place data mutations via Rack write_session semantics' do
    def simulate_rack_write(record)
      mutated = record.data
      yield mutated
      record.data = mutated
    end

    it 'marks the record dirty when the in-memory data hash is mutated in place' do
      record = create(:session, user: user, client: client, data: { 'last_request_at' => 2.hours.ago.to_i })
      reloaded = described_class.find(record.id)

      simulate_rack_write(reloaded) { |data| data['last_request_at'] = Time.current.to_i }

      expect(reloaded.changed?).to be(true)
    end

    it 'does not dirty the record when the incoming data equals the persisted data' do
      record = create(:session, user: user, client: client, data: { 'foo' => 'bar' })
      reloaded = described_class.find(record.id)

      reloaded.data = { 'foo' => 'bar' }

      expect(reloaded.changed?).to be(false)
    end

    it 'persists in-place mutations when the record is saved through the write_session gate' do
      initial_time = 2.hours.ago.to_i
      new_time = Time.current.to_i
      record = create(:session, user: user, client: client, data: { 'last_request_at' => initial_time })

      reloaded = described_class.find(record.id)
      simulate_rack_write(reloaded) { |data| data['last_request_at'] = new_time }

      expect(reloaded.changed?).to be(true)
      reloaded.save!

      expect(described_class.find(record.id).data['last_request_at']).to eq(new_time)
    end
  end
end
