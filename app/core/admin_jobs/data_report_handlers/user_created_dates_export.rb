# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class UserCreatedDatesExport < BaseHandler
      HEADERS = [
        'Subject Email',
        'User Created At'
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
        return [] if project_ids.blank?

        records = User.
                  joins('LEFT JOIN clients p ON p.id = users.project_id').
                  joins('LEFT JOIN clients c ON c.id = p.tte_id').
                  where(users: { project_id: project_ids, is_uat: false })

        if geo_restricted_top_level_client_ids.any?
          records = records.where.not(c: { id: geo_restricted_top_level_client_ids })
        end

        records = records.where(users: { created_at: created_at_range }) if created_at_range

        records.order('users.email').pluck('users.email', 'users.created_at')
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
