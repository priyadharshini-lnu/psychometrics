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

      parameter :start_date,
                type: :date,
                runtime_updatable: true,
                description: 'Filter start date'

      parameter :end_date,
                type: :date,
                runtime_updatable: true,
                description: 'Filter end date'

      def generate_file
        CSV.open(file_path, 'wb') do |csv|
          csv << HEADERS
          fetch_data.each do |row|
            csv << format_csv_row(row)
          end
        end
      end

      def self.file_extension
        'csv'
      end

      private

      def fetch_data
        records = UserReport.
                  joins('LEFT JOIN campaigns cmp ON cmp.id = user_reports.campaign_id').
                  joins('LEFT JOIN clients p ON p.id = cmp.project_id').
                  joins('LEFT JOIN reports r ON r.id = user_reports.report_id').
                  where(r: { id: report_ids })

        records = records.where(p: { id: project_ids }) if project_ids.present?
        records = records.where(created_at: created_at_range) if created_at_range

        records.
          group(
            'r.id',
            'r.name',
            'p.id',
            'p.name',
            'cmp.id',
            'cmp.name'
          ).
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

      def created_at_range
        return unless start_date.present? && end_date.present?

        start_date.beginning_of_day..end_date.end_of_day
      end

      def start_date
        config['start_date']&.to_date
      end

      def end_date
        config['end_date']&.to_date
      end
    end
  end
end
