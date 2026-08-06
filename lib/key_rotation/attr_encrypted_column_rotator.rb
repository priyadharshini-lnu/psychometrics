# frozen_string_literal: true

module KeyRotation
  # Re-encrypts attr_encrypted columns from old_key to new_key.
  # Uses aes-256-gcm (attr_encrypted default) with per-record random IV.
  #
  # Usage:
  #   KeyRotation::AttrEncryptedColumnRotator.call(
  #     model:   ApiKey,
  #     scope:   ApiKey.where.not(encrypted_token: nil),
  #     columns: [{ value: :encrypted_token, iv: :encrypted_token_iv }],
  #     old_key: old_key,
  #     new_key: new_key,
  #     skipped: skipped_no_iv,
  #     failed:  total_failed,
  #     label:   'ApiKey'
  #   )
  class AttrEncryptedColumnRotator
    def self.call(options)
      new(options).call
    end

    def initialize(options)
      @model   = options.fetch(:model)
      @scope   = options.fetch(:scope)
      @columns = options.fetch(:columns)
      @old_key = options.fetch(:old_key)
      @new_key = options.fetch(:new_key)
      @skipped = options.fetch(:skipped)
      @failed  = options.fetch(:failed)
      @label   = options.fetch(:label)
    end

    def call
      failed_ids = []
      @scope.find_in_batches(batch_size: 200) do |batch|
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
          changed = true if rotate_column(record, col[:value], col[:iv])
        rescue StandardError => e
          puts "  #{@label} #{record.id} [#{col[:value]}] failed: #{e.message}" # rubocop:disable Rails/Output
          failed_ids << record.id
        end
        rows << record if changed
      end
      rows
    end

    def rotate_column(record, value_col, iv_col)
      return false if record.send(value_col).blank?

      if record.send(iv_col).blank?
        @skipped << "#{@label}##{record.id}"
        return false
      end

      plaintext = decrypt(record.send(value_col), record.send(iv_col))
      return false if plaintext.nil?

      re_encrypted = encrypt(plaintext)
      record.send(:"#{value_col}=", re_encrypted[:value])
      record.send(:"#{iv_col}=", re_encrypted[:iv])
      true
    end

    def save_batch(rows)
      update_cols = @columns.flat_map { |c| [c[:value], c[:iv]] }
      @model.import rows, on_duplicate_key_update: update_cols, validate: false
      puts "  Batch done. Last ID: #{rows.last&.id}" # rubocop:disable Rails/Output
    end

    def decrypt(encrypted_value, iv_value)
      KeyRotation::AttrEncryptedCipher.decrypt(encrypted_value, iv_value, @old_key)
    end

    def encrypt(plaintext)
      KeyRotation::AttrEncryptedCipher.encrypt(plaintext, @new_key)
    end
  end
end
