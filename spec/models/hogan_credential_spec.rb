# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HoganCredential, type: :model do
  let(:user) { create(:user) }
  let(:encrypted_password) { 'encrypted_password' }
  let(:participant_id) { 'participant_id' }

  describe 'validations' do
    it 'is valid with valid attributes' do
      hogan_credential = HoganCredential.new(
        user: user,
        password: encrypted_password,
        participant_id: participant_id,
        active: true
      )
      expect(hogan_credential).to be_valid
    end

    it 'is invalid without an encrypted_password' do
      hogan_credential = HoganCredential.new(
        user: user,
        participant_id: participant_id,
        active: true
      )
      expect(hogan_credential).not_to be_valid
      expect(hogan_credential.errors[:encrypted_password]).to include("can't be blank")
    end

    it 'is invalid without a participant_id' do
      hogan_credential = HoganCredential.new(
        user: user,
        password: encrypted_password,
        active: true
      )
      expect(hogan_credential).not_to be_valid
      expect(hogan_credential.errors[:participant_id]).to include("can't be blank")
    end
  end

  describe 'callbacks' do
    it 'deactivates other active Hogan credentials for the user when a new one is set to active' do
      create(:hogan_credential, user: user, password: encrypted_password,
participant_id: participant_id, active: true)

      new_hogan_credential = HoganCredential.create!(
        user: user,
        password: encrypted_password,
        participant_id: participant_id,
        active: true
      )
      expect(HoganCredential.where(user_id: user.id, active: true).count).to eq(1)
      expect(new_hogan_credential).to be_active
    end
  end
end
