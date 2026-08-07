# frozen_string_literal: true

module EncodableId
  extend ActiveSupport::Concern

  class_methods do
    def encode_id(id)
      if id.present?
        hashids = Hashids.new(ENV.fetch('HASHIDS_SALT', nil), Settings.hashids_length.default)
        hashids.encode(id)
      end
    end

    # Decodes a hashids-encoded ID using the current HASHIDS_SALT.
    # Falls back to PREV_HASHIDS_SALT (comma-separated) only when the current
    # salt returns [] — this supports re-importing export files generated before
    # a HASHIDS_SALT rotation. The fallback is only attempted when the primary
    # decode returns empty to minimise the risk of resolving to the wrong record.
    def decode_id(id)
      length = Settings.hashids_length.default
      salts  = [
        ENV.fetch('HASHIDS_SALT', nil),
        *ENV.fetch('PREV_HASHIDS_SALT', '').split(',').map(&:strip)
      ].compact_blank.uniq

      salts.each do |salt|
        result = Hashids.new(salt, length).decode(id)
        return result if result.present?
      end

      []
    end

    def find_by_encoded_id(hash_id)
      decoded_id = decode_id(hash_id).try(:first)
      find(decoded_id)
    end
  end

  included do
    def encoded_id
      self.class.encode_id(id)
    end
  end
end
