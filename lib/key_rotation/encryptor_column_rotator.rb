# frozen_string_literal: true

module KeyRotation
  # Re-encrypts dedicated columns encrypted via Encryptor with a fixed IV (aes-256-cbc).
  # Used by models that call Encryptor directly rather than through attr_encrypted.
  #
  # Usage:
  #   KeyRotation::EncryptorColumnRotator.call(
  #     model:   SamlServiceProvider,
  #     scope:   SamlServiceProvider.all,
  #     columns: %i[encrypted_idp_certificate encrypted_idp_private_key],
  #     old_key: old_key,
  #     new_key: new_key,
  #     failed:  total_failed,
  #     label:   'SamlServiceProvider'
  #   )
  class EncryptorColumnRotator
    FIXED_IV  = Encryptor.default_options[:iv]
    ALGORITHM = Encryptor.default_options[:algorithm]

    def self.call(options)
      new(options).call
    end

    def initialize(options)
      @model   = options.fetch(:model)
      @scope   = options.fetch(:scope)
      @columns = options.fetch(:columns)
      @old_key = options.fetch(:old_key)
      @new_key = options.fetch(:new_key)
      @failed  = options.fetch(:failed)
      @label   = options.fetch(:label)
    end

    def call
      failed_ids = []
      @scope.find_in_batches(batch_size: 100) do |batch|
        rows = process_batch(batch, failed_ids)
        save_batch(rows) unless rows.empty?
      end
      @failed.concat(failed_ids.map { |id| "#{@label}##{id}" })
    end

    private

    def process_batch(batch, failed_ids)
      rows = []
      batch.each do |record|
        changed = false
        @columns.each do |col|
          changed = true if rotate_column(record, col)
        rescue StandardError => e
          puts "  #{@label} #{record.id} [#{col}] failed: #{e.message}" # rubocop:disable Rails/Output
          failed_ids << record.id
        end
        rows << record if changed
      end
      rows
    end

    def rotate_column(record, col)
      encoded = record.send(col)
      return false if encoded.blank?

      plaintext = decrypt_with_old_key(Base64.decode64(encoded))
      return false if plaintext.nil?

      record.send(
        :"#{col}=",
        Base64.encode64(Encryptor.encrypt(plaintext, key: @new_key, iv: FIXED_IV, algorithm: ALGORITHM))
      )
      true
    end

    def save_batch(rows)
      @model.import rows, on_duplicate_key_update: @columns, validate: false
      puts "  Batch done. Last ID: #{rows.last&.id}" # rubocop:disable Rails/Output
    end

    def decrypt_with_old_key(ciphertext)
      Encryptor.decrypt(ciphertext, key: @old_key, iv: FIXED_IV, algorithm: ALGORITHM)
    rescue OpenSSL::Cipher::CipherError
      nil
    end
  end
end
