# frozen_string_literal: true

# Re-encrypts HoganCredential#password from the previous HOGAN_ENCRYPTED_KEY to the new one.
#
# Setup in Heroku before running:
#   1. PREV_HOGAN_ENCRYPTED_KEY = current HOGAN_ENCRYPTED_KEY value  (old key)
#   2. HOGAN_ENCRYPTED_KEY      = SecureRandom.base64(32)            (new key)
#
# Usage:
#   bundle exec rake key_rotation:rotate_hogan_encrypted_key

namespace :key_rotation do
  desc 'Re-encrypt HoganCredential#password. Requires PREV_HOGAN_ENCRYPTED_KEY env var.'
  task rotate_hogan_encrypted_key: :environment do
    prev_raw_key = ENV.fetch('PREV_HOGAN_ENCRYPTED_KEY', nil)
    abort 'ERROR: PREV_HOGAN_ENCRYPTED_KEY env var must be set to the previous key value.' if prev_raw_key.blank?

    old_key = Base64.decode64(prev_raw_key)
    new_key = Base64.decode64(Settings.secrets.hogan.encrypted_key.to_s)

    if old_key.bytesize < 32
      abort "ERROR: PREV_HOGAN_ENCRYPTED_KEY decodes to #{old_key.bytesize} bytes — must be 32 bytes"
    end
    abort "ERROR: HOGAN_ENCRYPTED_KEY decodes to #{new_key.bytesize} bytes — must be 32 bytes." if new_key.bytesize < 32

    failed_ids    = []
    skipped_ids   = []

    puts "\n== Rotating HoganCredential#password =="

    HoganCredential.where.not(encrypted_password: nil).find_in_batches(batch_size: 200) do |batch|
      rows = []
      batch.each do |record|
        next if record.encrypted_password_iv.blank?

        plaintext = begin
          KeyRotation::AttrEncryptedCipher.decrypt(record.encrypted_password,
                                                   record.encrypted_password_iv, old_key)
        rescue OpenSSL::Cipher::CipherError
          # Already encrypted with new key — verify and skip
          begin
            KeyRotation::AttrEncryptedCipher.decrypt(record.encrypted_password,
                                                     record.encrypted_password_iv, new_key)
            skipped_ids << record.id
            next
          rescue OpenSSL::Cipher::CipherError
            # Neither key works — unrecoverable record
            skipped_ids << record.id
            next
          end
        end
        next if plaintext.nil?

        new_encrypted = KeyRotation::AttrEncryptedCipher.encrypt(plaintext, new_key)
        record.encrypted_password    = new_encrypted[:value]
        record.encrypted_password_iv = new_encrypted[:iv]
        rows << record
      rescue StandardError => e
        puts "  HoganCredential #{record.id} failed: #{e.message}"
        failed_ids << record.id
      end

      unless rows.empty?
        HoganCredential.import rows,
                               on_duplicate_key_update: %i[encrypted_password encrypted_password_iv],
                               validate: false
        puts "  Batch done. Last ID: #{rows.last&.id}"
      end
    end

    unless skipped_ids.empty?
      puts "\nSkipped #{skipped_ids.size} record(s) — unrecoverable with either key:"
      skipped_ids.each { |id| puts "  - HoganCredential##{id}" }
      puts 'Verify in production: HoganCredential.where.not(encrypted_password: nil).select { |h| h.password.nil? }'
    end

    if failed_ids.empty?
      puts "\nAll re-encryptable HoganCredential records re-encrypted successfully."
    else
      puts "\nRe-encryption completed with #{failed_ids.size} failure(s): #{failed_ids.inspect}"
      puts 'Re-run the task for failed records or investigate individually.'
      exit 1
    end
  end
end
