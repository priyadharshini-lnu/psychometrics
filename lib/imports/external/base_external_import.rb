module Imports
  module External
    class BaseExternalImport
      attr_accessor :raw_data_or_file, :assign, :extra

      def self.build(type)
        "Imports::External::#{type.capitalize}Import".constantize.new
      end

      def normalize_data(raw_data_or_file, extra)
        raise 'should be implemented in particular external import'
      end

      def process!(raw_data_or_file, assign, extra = {})
        assign.update(external_results: normalize_data(raw_data_or_file, extra))
      end

      def normalize_nested_hash(nested_hash, result_hash = {}, parent_keys = [])
        nested_hash.reduce(result_hash) do |normalized_hash, entity|
          next normalized_hash if excluded_fields.include?(entity.first)
          keys = parent_keys + [entity.first]
          if entity.last.is_a?(Hash)
            normalized_hash = normalize_nested_hash(entity.last, normalized_hash, keys)
          else
            normalized_hash[keys.join('.')] = entity.last
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
