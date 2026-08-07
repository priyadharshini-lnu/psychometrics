# frozen_string_literal: true

module PortableData
  module Exports
    class ExportFields < Base
      include SerializationStrategies::PrimitiveStrategy
      include SerializationStrategies::AttachmentStrategy
      include SerializationStrategies::RelatedResourceStrategy

      GLOBALLY_EXCLUDED_COLUMNS = %w[tenant_id].freeze

      def serialize
        _raw_schema.each do |schema|
          serialize_by_type(schema)
        end
        serialized_resources[self.class.resource_name][:schema] = self.class._raw_schema
        serialize_all_attributes_if_enabled
        verify_resource_import_order
        add_meta_details
      end

      def serialize_by_type(schema)
        type_handlers = {
          'primitive' => :serialize_primitive_type,
          'attachment' => :serialize_attachment_type,
          'relationship' => :serialize_relationship_type,
          'mappable' => :serialize_mappable_type,
          'related_resource' => :serialize_related_resource_type
        }

        schema[:type].each do |type|
          if (handler = type_handlers[type])
            send(handler, schema)
          end
        end
      end

      def verify_resource_import_order
        return if self.class.resource_import_order.nil?

        serialized_resources_names = serialized_resources.keys
        invalid_resource_names = serialized_resources_names.select do |resource_name|
          self.class.resource_import_order.exclude?(resource_name)
        end
        if invalid_resource_names.present?
          raise "Invalid resource specified in resource_import_order: #{invalid_resource_names.join(', ')}"
        end
      end

      def add_meta_details
        default_meta = build_default_meta

        last_updated = serialized_resources.values.reduce(nil) do |max_date, resource|
          next max_date unless resource.is_a?(Hash) && resource[:data].is_a?(Array)

          resource_dates = resource[:data].filter_map { |record| record[:updated_at] if record.is_a?(Hash) }
          [max_date, resource_dates.max].compact.max
        end

        default_meta[:last_updated_at] = last_updated if last_updated

        serialized_data = { meta: default_meta, resources: serialized_resources }
        serialized_data[:meta][:hmac_signature] = generate_hmac_signature(serialized_data)
        serialized_data
      end

      def serialize_all_attributes_if_enabled
        return unless self.class._all_attributes[:enabled]

        excluded = (self.class._all_attributes[:except] + GLOBALLY_EXCLUDED_COLUMNS).uniq
        column_names = self.class.resource_class.column_names - excluded
        column_names.map do |column_name|
          serialize_column_data(column_name.to_sym)
        end
      end

      def serialize_column_data(column_name)
        data = get_value(column_name)
        belongs_to_assoc = self.class.resource_class.reflect_on_all_associations.find do |r|
          r.instance_of?(ActiveRecord::Reflection::BelongsToReflection) && r.foreign_key == column_name.to_s
        end

        if data.is_a?(ActiveStorage::Attached::One)
          schema = { name: column_name, type: ['attachment'] }
          self.class.attachment_attributes(column_name)
          serialize_attachment_type(schema)
        elsif belongs_to_assoc
          schema = { name: column_name, type: ['relationship'], model: belongs_to_assoc.klass }
          self.class.relationship_attribute(column_name, model: belongs_to_assoc.klass.name)
          serialize_primitive_type(schema)
        else
          schema = { name: column_name, type: 'primitive' }
          self.class.attributes(column_name)
          serialize_primitive_type(schema)
        end
      end

      alias serialize_mappable_type serialize_primitive_type
      alias serialize_relationship_type serialize_primitive_type
    end
  end
end
