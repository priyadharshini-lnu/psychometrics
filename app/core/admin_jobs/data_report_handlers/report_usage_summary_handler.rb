# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class ReportUsageSummaryHandler < BaseHandler
      HEADERS = [
        'Report ID',
        'Report Name',
        'Project ID',
        'Project Name',
        'Campaign ID',
        'Campaign Name',
        'Count'
      ].freeze

      def generate_file
        CSV.open(file_path, 'wb') do |csv|
          csv << HEADERS
          fetch_data.each { |row| csv << row }
        end
      end

      def self.file_extension
        'csv'
      end

      private

      def fetch_data
        return [] if project_ids.blank?

        UserReport.
          joins('LEFT JOIN campaigns cmp ON cmp.id = user_reports.campaign_id').
          joins('LEFT JOIN clients p ON p.id = cmp.project_id').
          joins('LEFT JOIN reports r ON r.id = user_reports.report_id').
          where(r: { id: report_ids }, p: { id: project_ids }).
          group('r.id', 'r.name', 'p.id', 'p.name', 'cmp.id', 'cmp.name').
          pluck(
            'r.id',
            'r.name',
            'p.id',
            'p.name',
            'cmp.id',
            'cmp.name',
            'COUNT(user_reports.id)'
          )
      end
    end
  end
end
