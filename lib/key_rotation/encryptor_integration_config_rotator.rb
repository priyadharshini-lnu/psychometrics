# frozen_string_literal: true

module KeyRotation
  # Re-encrypts values inside Integration#config (a JSON hash) using aes-256-cbc.
  #
  # Usage:
  #   KeyRotation::EncryptorIntegrationConfigRotator.call(
  #     scope:       Integration.where(name: 'mettl'),
  #     config_keys: %w[public_key private_key],
  #     old_key:     old_key,
  #     new_key:     new_key,
  #     failed:      total_failed
  #   )
  class EncryptorIntegrationConfigRotator
    FIXED_IV  = Encryptor.default_options[:iv]
    ALGORITHM = Encryptor.default_options[:algorithm]

    def self.call(options)
      new(options).call
    end

    def initialize(options)
      @scope       = options.fetch(:scope)
      @config_keys = options.fetch(:config_keys)
      @old_key     = options.fetch(:old_key)
      @new_key     = options.fetch(:new_key)
      @failed      = options.fetch(:failed)
    end

    def call
      failed_ids = []
      @scope.find_in_batches(batch_size: 100) do |batch|
        rows = process_batch(batch, failed_ids)
        save_batch(rows) unless rows.empty?
      end
      @failed.concat(failed_ids.map { |id| "Integration##{id}" })
    end

    private

    def process_batch(batch, failed_ids)
      rows = []
      batch.each do |record|
        rows << record if rotate_record(record)
      rescue StandardError => e
        puts "  Integration #{record.id} (#{record.name}) failed: #{e.message}" # rubocop:disable Rails/Output
        failed_ids << record.id
      end
      rows
    end

    def rotate_record(record)
      cfg = record.config.dup
      return false if cfg.blank?

      changed = rotate_config_keys(cfg)
      record.config = cfg if changed
      changed
    end

    def rotate_config_keys(cfg)
      changed = false
      @config_keys.each do |key|
        next if cfg[key].blank?

        plaintext = decrypt_with_old_key(Base64.decode64(cfg[key]))
        next if plaintext.nil?

        cfg[key] = Base64.encode64(
          Encryptor.encrypt(plaintext, key: @new_key, iv: FIXED_IV, algorithm: ALGORITHM)
        )
        changed = true
      end
      changed
    end

    def save_batch(rows)
      Integration.import rows, on_duplicate_key_update: [:config], validate: false
      puts "  Batch done. Last ID: #{rows.last&.id}" # rubocop:disable Rails/Output
    end

    def decrypt_with_old_key(ciphertext)
      Encryptor.decrypt(ciphertext, key: @old_key, iv: FIXED_IV, algorithm: ALGORITHM)
    rescue OpenSSL::Cipher::CipherError
      nil
    end
  end
end
