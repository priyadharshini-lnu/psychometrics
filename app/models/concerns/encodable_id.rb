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

    def decode_id(id)
      hashids = Hashids.new(ENV.fetch('HASHIDS_SALT', nil), Settings.hashids_length.default)
      hashids.decode(id)
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
