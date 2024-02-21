# frozen_string_literal: true

module Utility
  class Hash
    def self.match?(hash, other_hash, attributes)
      hash.slice(*attributes) == other_hash.slice(*attributes)
    end

    def self.set_nested_key(hash, path, value, mode: :concat)
      keys = path.split('.')
      current_hash = hash
      current_value = hash.dig(*keys)

      keys.each_with_index do |key, index|
        unless index == keys.length - 1
          current_hash[key] ||= {}
          current_hash = current_hash[key]
          next
        end

        current_hash[key] = if mode == :concat && current_value.present?
                              current_value.is_a?(::Array) ? current_value << value : [current_value, value]
                            else
                              value
                            end
      end
      hash
    end
  end
end
