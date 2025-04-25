# frozen_string_literal: true

module PortableData
  module Exports
    module SerializationStrategies
      module PrimitiveStrategy
        def serialize_primitive_type(schema)
          value = get_value(schema[:name])
          if schema[:name] == :updated_at && (maximum_updated_at.nil? || maximum_updated_at < value)
            @maximum_updated_at = value
          end
          serialized_resources[self.class.resource_name][:data][schema[:name]] = value
        end
      end

      module AttachmentStrategy
        def serialize_attachment_type(schema)
          value = resource.send(schema[:name])
          unless value.is_a?(ActiveStorage::Attached::One)
            raise "Value for #{schema[:name]} is not an ActiveStorage::Attached::One"
          end

          attachment = value.attachment
          if attachment.nil?
            serialized_resources[self.class.resource_name][:data][schema[:name]] = nil
            return
          end
          serialized_resources[self.class.resource_name][:data][schema[:name]] = {
            attachment_id: attachment.id,
            blob_id: attachment.blob_id,
            url: attachment.url
          }
        end
      end

      module RelatedResourceStrategy
        def serialize_related_resource_type(schema)
          data = get_value(schema[:name])
          serializer_klass = schema[:klass]
          model_name = serializer_klass.resource_name
          serialized_resources[model_name] ||= { model: serializer_klass.resource_class }

          if schema[:name] == :updated_at && (maximum_updated_at.nil? || maximum_updated_at < value)
            @maximum_updated_at = value
          end

          serialize_related_data(data, schema, model_name, serializer_klass)
          serialized_resources[model_name][:schema] = serializer_klass._raw_schema
        end

        private

        def serialize_related_data(data, schema, model_name, serializer_klass)
          if data.respond_to?(:each)
            serialize_collection(data, schema, model_name, serializer_klass)
          else
            serialize_single(data, schema, model_name, serializer_klass)
          end
        end

        def serialize_collection(data, schema, model_name, _serializer_klass)
          serialized_resources[model_name][:data] ||= []
          data.each do |datum|
            serialized = schema[:klass].new(datum, @maximum_updated_at).serialize
            serialized_resources[model_name][:data] <<
              serialized[:resources][schema[:klass].resource_name][:data]
          end
        end

        def serialize_single(data, schema, model_name, _serializer_klass)
          serialized = schema[:klass].new(data, @maximum_updated_at).serialize
          serialized_resources[model_name][:data] =
            serialized[:resources][schema[:klass].resource_name][:data]
        end
      end
    end
  end
end
