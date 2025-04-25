# frozen_string_literal: true

module PortableData
  module Imports
    class RecordDeleter
      def initialize(deleted_records, json_file_content)
        @deleted_records = deleted_records
        @json_file_content = json_file_content
        @errors = []
      end

      def delete_all
        @deleted_records.each do |record|
          klass = @json_file_content[:resources][record[:resource_name]][:model]
          klass.constantize.where(id: record[:ids]).destroy_all
        rescue StandardError => e
          @errors << { message: "Error deleting #{klass} ##{record[:ids]}", details: e.message }
        end
        @errors
      end
    end
  end
end
