# frozen_string_literal: true

module PortableData
  module Exports
    class Base
      private_attr_reader :resource, :maximum_updated_at
      private_attr_accessor :serialized_resources

      def self.inherited(sub_class)
        sub_class.class_attribute :_raw_schema, default: []
        sub_class.class_attribute :_all_attributes, default: { except: [], enabled: false }
        sub_class.class_attribute :resource_import_order, default: nil
        sub_class.class_attribute :resource_class, default: nil
      end

      def self.resource_name
        resource_class.name.demodulize.underscore.pluralize.to_sym
      end

      def initialize(resource, maximum_updated_at = nil)
        @resource = resource
        @serialized_resources = initial_serialize_data
        @maximum_updated_at = maximum_updated_at
      end

      private

      def get_value(name)
        value = respond_to?(name) ? send(name) : resource.send(name)
        format_value(value)
      end

      def format_value(value)
        case value
          when ActiveSupport::TimeWithZone, Time, Date
            value.iso8601
          when BigDecimal
            value.to_f
          else
            value
        end
      end

      def initial_serialize_data
        { self.class.resource_name => { model: self.class.resource_class, schema: [], data: {} } }
      end

      def build_default_meta
        {
          source_app: ENV.fetch('REAL_ENV', nil),
          parent_resource: self.class.resource_name,
          last_updated_at: maximum_updated_at,
          exported_date: Time.zone.now,
          resource_import_order: self.class.resource_import_order || serialized_resources.keys
        }
      end

      def generate_hmac_signature(data)
        OpenSSL::HMAC.hexdigest('SHA256', Settings.secrets.import_export_secret, data.to_json)
      end
    end
  end
end
