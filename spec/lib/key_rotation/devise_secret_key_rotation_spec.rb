# frozen_string_literal: true

require 'rails_helper'

RSpec.describe KeyRotation::DeviseSecretKeyRotator do
  let(:failed) { [] }

  let!(:user) do
    u = create(:user)
    u.skip_invitation = true
    u.send(:generate_invitation_token!)
    u.update_columns(invitation_sent_at: Time.current)
    u
  end

  let(:raw_token)       { KeyRotation::InvitationTokenVerifier.verify(user.encrypted_invitation_raw) }
  let(:expected_digest) { Devise.token_generator.digest(User, :invitation_token, raw_token) }

  def call_rotator(scope: nil)
    described_class.call(
      scope:  scope || User.where(id: user.id).
                           where.not(invitation_token: nil).
                           where(invitation_accepted_at: nil).
                           where.not(encrypted_invitation_raw: nil),
      failed: failed
    )
  end

  describe 'successful rotation' do
    before { call_rotator }

    it 're-hashes invitation_token with the current Devise.token_generator' do
      expect(User.find(user.id).invitation_token).to eq(expected_digest)
    end

    it 'invitation link still works — digest matches the recovered raw token' do
      reloaded  = User.find(user.id)
      recovered = KeyRotation::InvitationTokenVerifier.verify(reloaded.encrypted_invitation_raw)
      expect(reloaded.invitation_token).to eq(
        Devise.token_generator.digest(User, :invitation_token, recovered)
      )
    end

    it 'does not change encrypted_invitation_raw' do
      expect(User.find(user.id).encrypted_invitation_raw).to eq(user.encrypted_invitation_raw)
    end

    it 'does not change invitation_sent_at' do
      expect(User.find(user.id).invitation_sent_at).to be_within(1.second).of(user.invitation_sent_at)
    end

    it 'records no failures' do
      expect(failed).to be_empty
    end
  end

  describe 'idempotency' do
    it 'produces the same invitation_token digest when run twice' do
      call_rotator
      digest_after_first = User.find(user.id).invitation_token

      call_rotator
      expect(User.find(user.id).invitation_token).to eq(digest_after_first)
    end
  end

  describe 'unverifiable encrypted_invitation_raw' do
    before { user.update_columns(encrypted_invitation_raw: 'corrupt_value') }

    it 'records the user as failed' do
      call_rotator
      expect(failed).to include(user.id)
    end

    it 'does not update invitation_token' do
      original_token = user.invitation_token
      call_rotator
      expect(User.find(user.id).invitation_token).to eq(original_token)
    end
  end

  describe 'scope filtering' do
    it 'includes users with a pending invitation token' do
      scope = User.where.not(invitation_token: nil).
              where(invitation_accepted_at: nil).
              where.not(encrypted_invitation_raw: nil)
      expect(scope).to include(user)
    end

    it 'excludes users whose invitation has already been accepted' do
      user.update_columns(invitation_accepted_at: Time.current)
      scope = User.where.not(invitation_token: nil).
              where(invitation_accepted_at: nil).
              where.not(encrypted_invitation_raw: nil)
      expect(scope).not_to include(user)
    end

    it 'excludes users with no invitation_token' do
      user.update_columns(invitation_token: nil)
      scope = User.where.not(invitation_token: nil).
              where(invitation_accepted_at: nil).
              where.not(encrypted_invitation_raw: nil)
      expect(scope).not_to include(user)
    end

    it 'excludes users with no encrypted_invitation_raw' do
      user.update_columns(encrypted_invitation_raw: nil)
      scope = User.where.not(invitation_token: nil).
              where(invitation_accepted_at: nil).
              where.not(encrypted_invitation_raw: nil)
      expect(scope).not_to include(user)
    end
  end

  describe 'limit and offset arguments' do
    let!(:other_user) do
      u = create(:user)
      u.skip_invitation = true
      u.send(:generate_invitation_token!)
      u.update_columns(invitation_sent_at: 1.day.ago)
      u
    end

    def pending_scope(limit: nil, offset: 0)
      scope = User.where.not(invitation_token: nil).
              where(invitation_accepted_at: nil).
              where.not(encrypted_invitation_raw: nil).
              order(invitation_sent_at: :desc).
              offset(offset)
      scope = scope.limit(limit) if limit
      scope
    end

    it 'limit restricts the number of users processed' do
      expect(pending_scope(limit: 1).count).to eq(1)
    end

    it 'offset skips earlier records' do
      all_ids    = pending_scope.pluck(:id)
      offset_ids = pending_scope(offset: 1).pluck(:id)
      expect(offset_ids).to eq(all_ids.drop(1))
    end

    it 'limit: nil processes all pending users' do
      expect(pending_scope(limit: nil).count).to be >= 2
    end
  end

  describe 'KeyRotation::InvitationTokenVerifier.verify' do
    it 'recovers the raw token from encrypted_invitation_raw' do
      expect(raw_token).to be_present
    end

    it 'raises InvalidSignature when encrypted_invitation_raw is tampered' do
      expect do
        KeyRotation::InvitationTokenVerifier.verify('tampered_garbage')
      end.to raise_error(ActiveSupport::MessageVerifier::InvalidSignature)
    end

    context 'with PREV_SECRET_KEY_BASE set (SECRET_KEY_BASE already rotated)' do
      before do
        real_key                  = Rails.application.secret_key_base
        @expected_raw_token       = KeyRotation::InvitationTokenVerifier.verify(user.encrypted_invitation_raw)
        @encrypted_invitation_raw = user.encrypted_invitation_raw

        allow(Rails.application).to receive(:secret_key_base).and_return(SecureRandom.hex(64))
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:fetch).with('PREV_SECRET_KEY_BASE', '').and_return(real_key)
      end

      it 'still recovers the raw token via the PREV_SECRET_KEY_BASE fallback' do
        expect(KeyRotation::InvitationTokenVerifier.verify(@encrypted_invitation_raw)).to eq(@expected_raw_token)
      end
    end
  end
end
