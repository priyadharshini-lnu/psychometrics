# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::AttrEncryptedColumnRotator, 'SmtpSetting#password' do
  let(:old_key) { Settings.secrets.encrypted_key.to_s }
  let(:new_key) { SecureRandom.base64(32) }
  let(:skipped) { [] }
  let(:failed)  { [] }
  let(:columns) { [{ value: :encrypted_password, iv: :encrypted_password_iv }] }

  let!(:smtp_setting) { create(:smtp_setting, project: create(:project)) }
  let(:original_password) { smtp_setting.password }

  def call_rotator
    described_class.call(
      model:   SmtpSetting,
      scope:   SmtpSetting.where(id: smtp_setting.id),
      columns: columns,
      old_key: Base64.decode64(old_key),
      new_key: Base64.decode64(new_key),
      skipped: skipped,
      failed:  failed,
      label:   'SmtpSetting'
    )
  end

  describe 'successful rotation' do
    it 'plaintext password is the same after rotation' do
      expect(original_password).to be_present
      call_rotator
      reloaded = SmtpSetting.find(smtp_setting.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_password, reloaded.encrypted_password_iv,
                                                      Base64.decode64(new_key))).
        to eq(original_password)
    end

    it 'changes the ciphertext stored in the database' do
      old_ciphertext = smtp_setting.encrypted_password
      call_rotator
      expect(SmtpSetting.find(smtp_setting.id).encrypted_password).not_to eq(old_ciphertext)
    end

    it 'password is no longer readable with the old key after rotation' do
      call_rotator
      reloaded = SmtpSetting.find(smtp_setting.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_password, reloaded.encrypted_password_iv,
                                                      Base64.decode64(old_key))).to be_nil
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end

  describe 'blank IV handling' do
    before { smtp_setting.update_columns(encrypted_password_iv: nil) }

    it 'does not fail the record' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'adds the record to the skipped list' do
      call_rotator
      expect(skipped).to include("SmtpSetting##{smtp_setting.id}")
    end

    it 'does not change the ciphertext' do
      original_ciphertext = smtp_setting.encrypted_password
      call_rotator
      expect(SmtpSetting.find(smtp_setting.id).encrypted_password).to eq(original_ciphertext)
    end
  end
end
