# frozen_string_literal: true

module ClientAuditlogExportSettings
  module S3
    class UploadStream < BaseCommand
      private_attr_reader :settings, :query, :file_name

      BATCH_SIZE = 1000

      def initialize(settings, query, file_name)
        @settings = settings
        @query = query
        @file_name = file_name
      end

      def call
        BuildObject.call!(settings, file_name).upload_stream do |write_stream|
          query.find_in_batches(batch_size: BATCH_SIZE) do |batch|
            batch.each do |record|
              write_stream << "#{record.attributes.to_json}\n"
            end
          end
        end

        broadcast :ok, query.length
      end
    end
  end
end
