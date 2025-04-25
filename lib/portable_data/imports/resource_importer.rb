# frozen_string_literal: true

module PortableData
  module Imports
    class ResourceImporter
      def initialize(resource_data, mappable_values)
        @resource_data = resource_data
        @mappable_values = mappable_values
        @model_class = resource_data[:model].constantize
        @schema = resource_data[:schema]
        @errors = []
      end

      def import
        records_with_data = process_resource_data
        save_records_in_batches(records_with_data)
        @errors
      end

      private

      def process_resource_data
        @resource_data[:data] = [@resource_data[:data]] unless @resource_data[:data].is_a?(Array)
        @resource_data[:data].map.with_index do |data, index|
          record = find_or_initialize_record(data)
          @schema.each { |field| import_field(record, field, data, index) }
          [record, data]
        end
      end

      def find_or_initialize_record(data)
        @model_class.find_by(id: data[:id]) || @model_class.new
      end

      def import_field(record, field, data, index)
        field_name = field[:name]
        field_value = data[field_name]

        case field[:type].first
          when 'primitive', 'mappable', 'relationship'
            record.send(:"#{field_name}=", field_value)
          when 'attachment'
            import_attachment(record, field_name, field_value, index) if field_value
        end
      end

      def import_attachment(record, field_name, attachment_data, index)
        AttachmentImporter.new(record, field_name, attachment_data, index).import
      end

      def save_records_in_batches(records_with_data)
        records_with_data.each_slice(100).with_index do |batch, batch_index|
          @model_class.transaction do
            lock_existing_records(batch)
            batch.each_with_index do |(record, _), record_index|
              record.save!
            rescue ActiveRecord::RecordInvalid => e
              @errors << log_error(e, batch_index, record_index, record)
            end
          end
        rescue StandardError => e
          @errors << log_batch_error(e, batch_index)
        end
      end

      def log_error(error, batch_index, record_index, record)
        message = "Error saving record in batch #{batch_index}, index #{record_index}: #{error.message}"
        details = "Record details: #{record.attributes}"
        { message:, details: }
      end

      def log_batch_error(error, batch_index)
        message = "Error processing batch #{batch_index}: #{error.message}"
        details = error.backtrace.join("\n")
        { message:, details: }
      end

      def lock_existing_records(batch)
        existing_records = batch.map(&:first).reject(&:new_record?)
        existing_ids = existing_records.map(&:id)

        @model_class.where(id: existing_ids).lock.to_a if existing_ids.any?
      end
    end
  end
end
