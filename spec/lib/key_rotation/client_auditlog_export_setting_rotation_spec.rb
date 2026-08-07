# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::AttrEncryptedColumnRotator,
               'ClientAuditlogExportSetting#s3_secret_access_key' do
  let(:old_key) { Settings.secrets.encrypted_key.to_s }
  let(:new_key) { SecureRandom.base64(32) }
  let(:skipped) { [] }
  let(:failed)  { [] }
  let(:columns) { [{ value: :encrypted_s3_secret_access_key, iv: :encrypted_s3_secret_access_key_iv }] }

  let!(:setting) do
    create(:client_auditlog_export_setting, client: create(:tenancy), s3_secret_access_key: 'my-s3-secret')
  end
  let(:original_value) { setting.s3_secret_access_key }

  def call_rotator
    described_class.call(
      model:   ClientAuditlogExportSetting,
      scope:   ClientAuditlogExportSetting.where(id: setting.id),
      columns: columns,
      old_key: Base64.decode64(old_key),
      new_key: Base64.decode64(new_key),
      skipped: skipped,
      failed:  failed,
      label:   'ClientAuditlogExportSetting'
    )
  end

  describe 'successful rotation' do
    it 'plaintext s3_secret_access_key is the same after rotation' do
      expect(original_value).to be_present
      call_rotator
      reloaded = ClientAuditlogExportSetting.find(setting.id)
      expect(
        KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_s3_secret_access_key,
                                                 reloaded.encrypted_s3_secret_access_key_iv, Base64.decode64(new_key))
      ).to eq(original_value)
    end

    it 'changes the ciphertext stored in the database' do
      old_ciphertext = setting.encrypted_s3_secret_access_key
      call_rotator
      expect(ClientAuditlogExportSetting.find(setting.id).encrypted_s3_secret_access_key).
        not_to eq(old_ciphertext)
    end

    it 'key is no longer readable with the old key after rotation' do
      call_rotator
      reloaded = ClientAuditlogExportSetting.find(setting.id)
      expect(
        KeyRotation::AttrEncryptedCipher.decrypt(
          reloaded.encrypted_s3_secret_access_key, reloaded.encrypted_s3_secret_access_key_iv, Base64.decode64(old_key)
        )
      ).to be_nil
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end

  describe 'blank IV handling' do
    before { setting.update_columns(encrypted_s3_secret_access_key_iv: nil) }

    it 'does not fail the record' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'adds the record to the skipped list' do
      call_rotator
      expect(skipped).to include("ClientAuditlogExportSetting##{setting.id}")
    end
  end
end
