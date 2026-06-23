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
          fetch_data.each { |row| csv << row }
        end
      end

      def self.file_extension
        'csv'
      end

      private

      def fetch_data
        return [] if project_ids.blank?

        User.
          where(project_id: project_ids).
          order(:email).
          pluck(:email, :created_at).
          map do |email, created_at|
            [email, format_timestamp(created_at)]
          end
      end

      def format_timestamp(timestamp)
        timestamp.strftime('%Y-%m-%d %H:%M:%S %:z')
      end
    end
  end
end
