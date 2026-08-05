# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::AttrEncryptedColumnRotator, 'Campaign#pdf_password' do
  let(:old_key) { Settings.secrets.encrypted_key.to_s }
  let(:new_key) { SecureRandom.base64(32) }
  let(:skipped) { [] }
  let(:failed)  { [] }
  let(:columns) { [{ value: :encrypted_pdf_password, iv: :encrypted_pdf_password_iv }] }

  let!(:campaign) { create(:campaign) }
  let(:original_pdf_password) { campaign.pdf_password }

  def call_rotator
    described_class.call(
      model:   Campaign,
      scope:   Campaign.where(id: campaign.id),
      columns: columns,
      old_key: Base64.decode64(old_key),
      new_key: Base64.decode64(new_key),
      skipped: skipped,
      failed:  failed,
      label:   'Campaign'
    )
  end

  describe 'successful rotation' do
    it 'plaintext pdf_password is the same after rotation' do
      expect(original_pdf_password).to be_present
      call_rotator
      reloaded = Campaign.find(campaign.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_pdf_password,
                                                      reloaded.encrypted_pdf_password_iv, Base64.decode64(new_key))).
        to eq(original_pdf_password)
    end

    it 'changes the ciphertext stored in the database' do
      old_ciphertext = campaign.encrypted_pdf_password
      call_rotator
      expect(Campaign.find(campaign.id).encrypted_pdf_password).not_to eq(old_ciphertext)
    end

    it 'pdf_password is no longer readable with the old key after rotation' do
      call_rotator
      reloaded = Campaign.find(campaign.id)
      expect(
        KeyRotation::AttrEncryptedCipher.decrypt(
          reloaded.encrypted_pdf_password, reloaded.encrypted_pdf_password_iv, Base64.decode64(old_key)
        )
      ).to be_nil
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end

  describe 'blank IV handling' do
    before { campaign.update_columns(encrypted_pdf_password_iv: nil) }

    it 'does not fail the record' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'adds the record to the skipped list' do
      call_rotator
      expect(skipped).to include("Campaign##{campaign.id}")
    end

    it 'does not change the ciphertext' do
      original_ciphertext = campaign.encrypted_pdf_password
      call_rotator
      expect(Campaign.find(campaign.id).encrypted_pdf_password).to eq(original_ciphertext)
    end
  end
end
