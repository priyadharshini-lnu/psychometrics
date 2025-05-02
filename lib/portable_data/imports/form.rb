# frozen_string_literal: true

module PortableData
  module Imports
    class Form < Rectify::Form
      attribute :json_file_content, Hash

      validate :verify_hmac_signature

      def initialize(attributes = {})
        super
        @json_file_content = parsed_json_file_content(attributes[:json_file_content])
      end

      def change_logs
        ChangeLogGenerator.new(existing_json, json_file_content).generate
      end

      def deleted_records
        change_logs.each_with_object(Hash.new { |h, k| h[k] = [] }) do |change, h|
          next unless change[0] == 'Deleted'

          resource_name = change[1].split(' → ')[0]
          h[resource_name] << change.dig(2, :id)
        end.map { |k, v| { resource_name: k, ids: v } }
      end

      def parsed_json_file_content(json_file_content)
        ActiveSupport::HashWithIndifferentAccess.new(JSON.parse(json_file_content, symbolize_names: true))
      rescue JSON::ParserError
        errors.add(:base, 'Invalid JSON format')
      end

      private

      def existing_json
        parent_resource_name = json_file_content[:meta][:parent_resource].to_s
        parent_resource_data = json_file_content[:resources][parent_resource_name.to_sym]

        return {} unless parent_resource_data

        parent_id = parent_resource_data[:data][:id]
        parent_model = parent_resource_data[:model].to_s.constantize
        parent_instance = parent_model.find_by(id: parent_id)

        return {} unless parent_instance

        PortableData::Exports::Resources::DimensionExportDefinition.new(parent_instance).serialize
      end

      def verify_hmac_signature
        expected_signature = json_file_content[:meta]&.[](:hmac_signature)
        unless expected_signature
          errors.add(:base, 'HMAC signature missing')
          return
        end

        content_for_signature = json_file_content.deep_dup
        content_for_signature[:meta].delete(:hmac_signature)
        content_string = content_for_signature.to_json
        actual_signature = OpenSSL::HMAC.hexdigest('SHA256', Settings.secrets.import_export_secret, content_string)

        unless ActiveSupport::SecurityUtils.secure_compare(expected_signature, actual_signature)
          errors.add(:base, 'Invalid HMAC signature')
        end
      end
    end
  end
end
