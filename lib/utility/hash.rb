# frozen_string_literal: true

module Utility
  class Hash
    def self.match?(hash, other_hash, attributes)
      hash.slice(*attributes) == other_hash.slice(*attributes)
    end
  end
end
