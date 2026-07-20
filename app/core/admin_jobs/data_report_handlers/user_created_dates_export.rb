# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class UserCreatedDatesExport < BaseHandler
      HEADERS = [
        'Subject Email',
        'User Created At'
      ].freeze

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
        return [] if project_ids.blank?

        records = User.where(project_id: project_ids)
        records = records.where(created_at: created_at_range) if created_at_range
        records.order(:email).pluck(:email, :created_at)
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
