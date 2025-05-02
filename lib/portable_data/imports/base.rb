# frozen_string_literal: true

module PortableData
  module Imports
    class Base
      private_attr_reader :json_file_content, :mappable_values, :deleted_records, :errors

      def initialize(json_file_content:, mappable_values: {}, deleted_records: [])
        @json_file_content = json_file_content
        @deleted_records = deleted_records
        @mappable_values = mappable_values
        @errors = []
      end

      def import!
        validate_import_form
        adjust_mappable_values!
        perform_import_with_transaction
        nil
      rescue StandardError => e
        errors << e.message
        errors
      end

      private

      def validate_import_form
        form = Form.new(json_file_content: json_file_content)
        @json_file_content = form.json_file_content
        @mappable_values = transform_mappable_values(json_file_content, mappable_values)
        raise InvalidSignatureError, form.errors.full_messages.to_sentence unless form.valid?
      end

      def adjust_mappable_values!
        MappableValuesAdjuster.new(json_file_content, mappable_values).adjust!
      end

      def perform_import_with_transaction
        ApplicationRecord.transaction do
          import_resources
          delete_records! if errors.empty?
          raise ImportFailedError if errors.present?
        end
      end

      def import_resources
        json_file_content.dig(:meta, :resource_import_order)&.each do |resource_name|
          resource_data = json_file_content.dig(:resources, resource_name)
          errors.concat(ResourceImporter.new(resource_data, mappable_values).import)
        end
      end

      def delete_records!
        errors.concat(RecordDeleter.new(deleted_records, json_file_content).delete_all)
      end

      def transform_mappable_values(json_file_content, mappable_values)
        MappableValuesTransformer.new(json_file_content, mappable_values).transform
      end

      class AttachmentImportError < StandardError; end
      class InvalidSignatureError < StandardError; end
      class ImportFailedError < StandardError; end
    end
  end
end
