# frozen_string_literal: true

module PortableData
  module Imports
    class MappableValuesTransformer
      def initialize(json_file_content, raw_mappable_values)
        @json_file_content = json_file_content
        @raw_mappable_values = raw_mappable_values.with_indifferent_access
      end

      def transform
        @json_file_content['resources'].each_with_object({}) do |(resource_type, resource_data), transformed|
          next unless @raw_mappable_values.key?(resource_type)

          transformed[resource_type] = transform_resource(resource_type, resource_data)
        end
      end

      private

      def transform_resource(resource_type, resource_data)
        @raw_mappable_values[resource_type].transform_values do |value|
          data = resource_data['data']
          transform_data(data, @raw_mappable_values[resource_type].keys.first, value)
        end
      end

      def transform_data(data, key, value)
        case data
          when Hash
            { data[key].to_s => value }
          when Array
            data.each_with_object({}) { |item, hash| hash[item[key].to_s] = value }
        end
      end
    end
  end
end
