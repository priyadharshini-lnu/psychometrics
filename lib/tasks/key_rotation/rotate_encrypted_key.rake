# frozen_string_literal: true

# Re-encrypts all columns from the previous ENCRYPTED_KEY to the new one.
#
# Setup in Heroku before running:
#   1. PREV_ENCRYPTED_KEY = current ENCRYPTED_KEY value  (old key)
#   2. ENCRYPTED_KEY      = SecureRandom.base64(32)      (new key)
#
# Usage:
#   bundle exec rake key_rotation:rotate_encrypted_key

namespace :key_rotation do
  desc 'Re-encrypt all ENCRYPTED_KEY-protected columns. Requires PREV_ENCRYPTED_KEY env var.'
  task rotate_encrypted_key: :environment do
    prev_raw_key = ENV.fetch('PREV_ENCRYPTED_KEY', nil)
    abort 'ERROR: PREV_ENCRYPTED_KEY env var must be set to the previous key value.' if prev_raw_key.blank?

    old_key = Base64.decode64(prev_raw_key)
    new_key = Base64.decode64(Settings.secrets.encrypted_key.to_s)

    if old_key.bytesize < 32
      abort "ERROR: PREV_ENCRYPTED_KEY decodes to #{old_key.bytesize} bytes — must be 32 bytes"
    end
    if new_key.bytesize < 32
      abort "ERROR: ENCRYPTED_KEY decodes to #{new_key.bytesize} bytes — must be 32 bytes (SecureRandom.base64(32))"
    end

    total_failed  = []
    skipped_no_iv = []

    # -- attr_encrypted columns (aes-256-gcm, per-record random IV) --

    puts "\n[1/7] ApiKey#token"
    KeyRotation::AttrEncryptedColumnRotator.call(
      model:   ApiKey,
      scope:   ApiKey.where.not(encrypted_token: nil),
      columns: [{ value: :encrypted_token, iv: :encrypted_token_iv }],
      old_key: old_key, new_key: new_key,
      skipped: skipped_no_iv, failed: total_failed, label: 'ApiKey'
    )

    puts "\n[2/7] Campaign#pdf_password"
    KeyRotation::AttrEncryptedColumnRotator.call(
      model:   Campaign,
      scope:   Campaign.where.not(encrypted_pdf_password: nil),
      columns: [{ value: :encrypted_pdf_password, iv: :encrypted_pdf_password_iv }],
      old_key: old_key, new_key: new_key,
      skipped: skipped_no_iv, failed: total_failed, label: 'Campaign'
    )

    puts "\n[3/7] ClientAuditlogExportSetting#s3_secret_access_key"
    KeyRotation::AttrEncryptedColumnRotator.call(
      model:   ClientAuditlogExportSetting,
      scope:   ClientAuditlogExportSetting.where.not(encrypted_s3_secret_access_key: nil),
      columns: [{ value: :encrypted_s3_secret_access_key, iv: :encrypted_s3_secret_access_key_iv }],
      old_key: old_key, new_key: new_key,
      skipped: skipped_no_iv, failed: total_failed, label: 'ClientAuditlogExportSetting'
    )

    puts "\n[4/7] SmtpSetting#password"
    KeyRotation::AttrEncryptedColumnRotator.call(
      model:   SmtpSetting,
      scope:   SmtpSetting.where.not(encrypted_password: nil),
      columns: [{ value: :encrypted_password, iv: :encrypted_password_iv }],
      old_key: old_key, new_key: new_key,
      skipped: skipped_no_iv, failed: total_failed, label: 'SmtpSetting'
    )

    puts "\n[5/7] WebhookSystem::Subscription"
    KeyRotation::AttrEncryptedColumnRotator.call(
      model:   WebhookSystem::Subscription,
      scope:   WebhookSystem::Subscription.all,
      columns: [
        { value: :encrypted_password,            iv: :encrypted_password_iv },
        { value: :encrypted_api_key,             iv: :encrypted_api_key_iv },
        { value: :encrypted_oauth_client_id,     iv: :encrypted_oauth_client_id_iv },
        { value: :encrypted_oauth_client_secret, iv: :encrypted_oauth_client_secret_iv }
      ],
      old_key: old_key, new_key: new_key,
      skipped: skipped_no_iv, failed: total_failed, label: 'WebhookSystem::Subscription'
    )

    # -- Encryptor columns (aes-256-cbc, fixed IV) --

    puts "\n[6/7] SamlServiceProvider (idp_certificate, idp_private_key)"
    KeyRotation::EncryptorColumnRotator.call(
      model:   SamlServiceProvider,
      scope:   SamlServiceProvider.all,
      columns: %i[encrypted_idp_certificate encrypted_idp_private_key],
      old_key: old_key, new_key: new_key,
      failed:  total_failed, label: 'SamlServiceProvider'
    )

    puts "\n[7/7] Integration#config (iiht, mettl, skillvue, microsite)"
    {
      'iiht' => %w[password],
      'mettl' => %w[public_key private_key],
      'skillvue' => %w[api_key],
      'microsite' => %w[api_key]
    }.each do |integration_name, config_keys|
      KeyRotation::IntegrationConfigRotator.call(
        scope:       Integration.where(name: integration_name),
        config_keys: config_keys,
        old_key:     old_key,
        new_key:     new_key,
        failed:      total_failed
      )
    end

    unless skipped_no_iv.empty?
      puts "\nSkipped #{skipped_no_iv.size} record(s) with a blank IV (corrupt records — cannot be decrypted):"
      skipped_no_iv.each { |ref| puts "  - #{ref}" }
      puts 'These records are already unreadable. Investigate and fix individually.'
    end

    if total_failed.empty?
      puts "\nAll re-encryptable records re-encrypted successfully."
    else
      puts "\nRe-encryption completed with #{total_failed.size} failure(s):"
      total_failed.each { |ref| puts "  - #{ref}" }
      puts 'Re-run the task for failed records or investigate individually.'
      exit 1
    end
  end
end
