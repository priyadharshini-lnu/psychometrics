# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationPublicKey, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:application_user) { create(:application_user, tenant: tenant) }
  let(:rsa_key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:public_key_pem) { rsa_key.public_key.to_pem }

  subject(:public_key) { build(:application_public_key, user: application_user, public_key: public_key_pem) }

  describe 'validations' do
    it { is_expected.to be_valid }

    it 'is invalid without a public key' do
      public_key.public_key = nil
      expect(public_key).not_to be_valid
      expect(public_key.errors[:public_key]).to be_present
    end

    it 'is invalid with a malformed PEM' do
      public_key.public_key = 'not-a-valid-pem'
      expect(public_key).not_to be_valid
      expect(public_key.errors[:public_key]).to be_present
    end

    it 'is invalid when given a private key instead of a public key' do
      public_key.public_key = rsa_key.to_pem
      expect(public_key).not_to be_valid
      expect(public_key.errors[:public_key]).to be_present
    end

    it 'prevents changing the public key after creation' do
      public_key.save!
      public_key.public_key = OpenSSL::PKey::RSA.generate(2048).public_key.to_pem
      expect(public_key).not_to be_valid
      expect(public_key.errors[:public_key]).to be_present
    end
  end

  describe 'before_validation on create' do
    it 'assigns a unique key_id automatically' do
      expect { public_key.save! }.to change { public_key.key_id }.from(nil)

      expect(public_key.key_id).to be_a(Integer)
      expect(public_key.key_id).to be > 0
    end

    it 'assigns a fingerprint automatically' do
      expect { public_key.save! }.to change { public_key.fingerprint }.from(nil)
      expect(public_key.fingerprint).to start_with('SHA256:')
    end

    it 'generates a consistent fingerprint for the same public key' do
      public_key.save!
      other = create(:application_public_key, user: application_user, public_key: public_key_pem)
      expect(public_key.fingerprint).to eq(other.fingerprint)
    end

    it 'generates different fingerprints for different public keys' do
      public_key.save!
      other_pem = OpenSSL::PKey::RSA.generate(2048).public_key.to_pem
      other = create(:application_public_key, user: application_user, public_key: other_pem)
      expect(public_key.fingerprint).not_to eq(other.fingerprint)
    end
  end

  describe '#openssl_key' do
    it 'returns an OpenSSL::PKey::RSA object for a valid public key' do
      public_key.save!
      expect(public_key.openssl_key).to be_a(OpenSSL::PKey::RSA)
    end

    it 'returns nil when the stored public key is invalid' do
      public_key_record = build(:application_public_key, user: application_user)
      public_key_record.public_key = 'corrupted-pem'
      expect(public_key_record.openssl_key).to be_nil
    end
  end

  describe '#activate! / #deactivate!' do
    let!(:saved_key) { create(:application_public_key, user: application_user, public_key: public_key_pem) }

    it 'deactivates an active key' do
      expect { saved_key.deactivate! }.to change { saved_key.reload.disabled }.from(false).to(true)
    end

    it 'activates a deactivated key' do
      saved_key.deactivate!
      expect { saved_key.activate! }.to change { saved_key.reload.disabled }.from(true).to(false)
    end
  end

  describe 'scopes' do
    let!(:active_key) { create(:application_public_key, user: application_user, public_key: public_key_pem) }
    let!(:inactive_key) do
      create(:application_public_key, user: application_user,
             public_key: OpenSSL::PKey::RSA.generate(2048).public_key.to_pem, disabled: true)
    end

    it 'active scope returns only enabled keys' do
      expect(ApplicationPublicKey.active).to include(active_key)
      expect(ApplicationPublicKey.active).not_to include(inactive_key)
    end

    it 'inactive scope returns only disabled keys' do
      expect(ApplicationPublicKey.inactive).to include(inactive_key)
      expect(ApplicationPublicKey.inactive).not_to include(active_key)
    end
  end
end
