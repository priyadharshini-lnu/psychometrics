# frozen_string_literal: true

module Imports
  module External
    class BaseExternalImport
      attr_accessor :data, :assign, :extra

      def self.build(type)
        "Imports::External::#{type.capitalize}Import".constantize.new
      end

      def normalize_data(_data, _extra)
        raise 'should be implemented in particular external import'
      end

      def process(data, _assign, extra = {})
        normalize_data(data, extra)
      end

      def normalize_nested_hash(nested_hash, result_hash = {}, parent_keys = [])
        nested_hash.reduce(result_hash) do |normalized_hash, entity|
          keys = parent_keys + [entity.first]
          key = keys.join('.')
          next normalized_hash if excluded_fields.include?(key)

          if entity.last.is_a?(Hash)
            normalized_hash = normalize_nested_hash(entity.last, normalized_hash, keys)
          else
            normalized_hash[key] = entity.last
          end
          normalized_hash
        end
      end

      def excluded_fields
        []
      end
    end
  end
end
