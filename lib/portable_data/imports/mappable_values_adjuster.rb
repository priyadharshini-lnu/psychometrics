# frozen_string_literal: true

module PortableData
  module Imports
    class MappableValuesAdjuster
      def initialize(json_file_content, mappable_values)
        @json_file_content = json_file_content
        @mappable_values = mappable_values
      end

      def adjust!
        @json_file_content[:resources].each do |resource_name, resource_data|
          resource_data[:data] = [resource_data[:data]] unless resource_data[:data].is_a?(Array)
          adjust_resource_data(resource_name, resource_data)
        end
      end

      private

      def adjust_resource_data(resource_name, resource_data)
        resource_data[:data].each do |data|
          resource_data[:schema].each do |field|
            adjust_field(resource_name, field, data)
          end
        end
      end

      def adjust_field(resource_name, field, data)
        if field[:type].include?('mappable') && @mappable_values.dig(resource_name, field[:name])
          data[field[:name]] = @mappable_values[resource_name][field[:name]][data[field[:name]].to_s]
        end
      end
    end
  end
end
