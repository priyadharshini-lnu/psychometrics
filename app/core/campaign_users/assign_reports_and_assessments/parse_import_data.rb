# frozen_string_literal: true

module CampaignUsers
  module AssignReportsAndAssessments
    class ParseImportData < BaseCommand
      private_attr_reader :records

      HEADER_IMPORT_KEYS = [
        'Email',
        'Report Bundle Id',
        'Report Id',
        'Assessment Id',
        'Norm Id'
      ].freeze

      def initialize(import_data, campaign)
        @campaign = campaign
        @records =
          if import_data.is_a?(ActionDispatch::Http::UploadedFile) || import_data.is_a?(Rack::Test::UploadedFile)
            Roo::CSV.new(import_data.path).to_a
          else
            import_data
          end
      end

      def call
        header = records.shift
        rows = records.map do |record|
          {
            email: record[0],
            report_bundle_id: record[1].to_i,
            report_id: record[2].to_i,
            assessment_id: record[3].to_i,
            norm_id: record[4].to_i
          }
        end
        broadcast :ok, [header] + rows
      end

      private

      def keys
        @keys ||= HEADER_IMPORT_KEYS
      end
    end
  end
end
