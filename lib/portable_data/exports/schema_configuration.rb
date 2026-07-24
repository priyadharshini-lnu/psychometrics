# frozen_string_literal: true

module PortableData
  module Exports
    module SchemaConfiguration
      def self.included(base)
        base.extend(ClassMethods)
      end

      module ClassMethods
        def configure
          yield self if block_given?
        end

        def import_order(order = nil)
          if order
            self.resource_import_order = order
          else
            resource_import_order
          end
        end

        def klass(klass)
          self.resource_class = klass
        end

        def all_attributes(except: [])
          self._all_attributes = { except: except, enabled: true }
        end

        def attributes(*column_names)
          column_names.each { |column_name| add_primitive(column_name) }
        end

        def attachment_attributes(*column_names)
          column_names.each { |column_name| add_attachment(column_name) }
        end

        def mappable_attribute(column_name)
          add_mappable(column_name)
        end

        def relationship_attribute(column_name, model:)
          add_relationship(column_name, model: model)
        end

        def deferred_relationship_attribute(column_name, model:)
          add_to_schema(column_name, 'deferred_relationship', model: model)
          add_to_schema(column_name, 'relationship', model: model)
        end

        def related_resource(name, klass: nil, model: nil)
          add_related_resource(name, klass: klass, model: model)
        end

        private

        def add_primitive(column_name)
          add_to_schema(column_name, 'primitive')
        end

        def add_attachment(column_name)
          add_to_schema(column_name, 'attachment')
        end

        def add_mappable(column_name)
          add_to_schema(column_name, 'mappable')
        end

        def add_relationship(column_name, model:)
          add_to_schema(column_name, 'relationship', model: model)
        end

        def add_related_resource(name, klass: nil, model: nil)
          raise 'Either klass or model must be provided' if klass.nil? && model.nil?

          klass ||= build_default_export_class(model)
          add_to_schema(name.to_sym, 'related_resource', klass: klass)
        end

        def build_default_export_class(model)
          Class.new(ExportFields) do
            include SchemaConfiguration

            configure(&:all_attributes)

            define_singleton_method(:resource_class) { model }
          end
        end

        def add_to_schema(attr, type, **options)
          existing_schema_index = _raw_schema.find_index { |schema| schema[:name].to_s == attr.to_s }
          if existing_schema_index
            existing_schema = _raw_schema[existing_schema_index]
            conflicting_options = existing_schema.except(:type).keys & options.except(:type).keys
            if conflicting_options.any? { |key| existing_schema[key] != options[key] }
              raise "Attr: #{attr}, Type: #{type}. Conflicting options: #{conflicting_options.join(', ')}"
            end

            _raw_schema[existing_schema_index] = {
              **existing_schema,
              **options,
              type: existing_schema[:type].push(type).uniq
            }
          else
            new_definition = {
              **options,
              name: attr.to_sym,
              type: [type]
            }
            _raw_schema << new_definition
          end
        end
      end
    end
  end
end
