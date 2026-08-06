# frozen_string_literal: true

require 'rails_helper'

RSpec.describe KeyRotation::InvitationTokenRotator do
  # old_secret is the current test SECRET_TOKEN_FOR_GENERATE.
  # Users created normally have encrypted_invitation_raw signed with it.
  let(:old_secret)  { Settings.secrets.secret_token_for_generate.to_s }
  let(:new_secret)  { SecureRandom.hex(64) }
  let(:failed)      { [] }
  let(:skipped)     { [] }

  let(:old_verifier) { Rails.application.message_verifier(old_secret) }
  let(:new_verifier) { Rails.application.message_verifier(new_secret) }

  # Create a user with a pending invitation signed by the current secret.
  let!(:user) do
    u = create(:user)
    u.skip_invitation = true
    u.send(:generate_invitation_token!)
    u.update_columns(invitation_sent_at: Time.current)
    u
  end

  # Capture the raw token before rotation.
  let(:original_raw_token) { old_verifier.verify(user.encrypted_invitation_raw) }

  def call_rotator(prev_secret: old_secret, next_secret: new_secret)
    described_class.call(
      prev_secret: prev_secret,
      new_secret:  next_secret,
      scope:       User.where(id: user.id).
                       where.not(invitation_token: nil).
                       where(invitation_accepted_at: nil).
                       where.not(encrypted_invitation_raw: nil),
      failed:      failed,
      skipped:     skipped
    )
  end

  describe 'successful rotation' do
    it 'raw token is the same after rotation' do
      expect(original_raw_token).to be_present

      call_rotator

      reloaded = User.find(user.id)
      expect(new_verifier.verify(reloaded.encrypted_invitation_raw)).to eq(original_raw_token)
    end

    it 'changes encrypted_invitation_raw in the database' do
      old_value = user.encrypted_invitation_raw
      call_rotator
      expect(User.find(user.id).encrypted_invitation_raw).not_to eq(old_value)
    end

    it 'old secret can no longer verify encrypted_invitation_raw after rotation' do
      call_rotator
      reloaded = User.find(user.id)
      expect { old_verifier.verify(reloaded.encrypted_invitation_raw) }.
        to raise_error(ActiveSupport::MessageVerifier::InvalidSignature)
    end

    it 'invitation link still works — Devise digest matches raw token after rotation' do
      call_rotator
      reloaded = User.find(user.id)
      rotated_raw = new_verifier.verify(reloaded.encrypted_invitation_raw)
      expect(reloaded.invitation_token).to eq(
        Devise.token_generator.digest(User, :invitation_token, rotated_raw)
      )
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'records nothing as skipped' do
      call_rotator
      expect(skipped).to be_empty
    end
  end

  describe 'wrong previous secret — token is unverifiable' do
    it 'adds the user to the skipped list' do
      call_rotator(prev_secret: SecureRandom.hex(64))
      expect(skipped).to include(user.id)
    end

    it 'does not change encrypted_invitation_raw when skipped' do
      old_value = user.encrypted_invitation_raw
      call_rotator(prev_secret: SecureRandom.hex(64))
      expect(User.find(user.id).encrypted_invitation_raw).to eq(old_value)
    end

    it 'records no failures when skipped' do
      call_rotator(prev_secret: SecureRandom.hex(64))
      expect(failed).to be_empty
    end
  end
end
