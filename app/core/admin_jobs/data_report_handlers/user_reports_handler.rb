# frozen_string_literal: true

require 'csv'

module AdminJobs
  module DataReportHandlers
    class UserReportsHandler < BaseHandler
      HEADERS = [
        'Project ID',
        'Project Name',
        'Campaign ID',
        'Campaign Name',
        'Subject Name',
        'Subject Email',
        'Report ID',
        'Report Name',
        'Report Added Date',
        'User Added Date'
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

        UserReport.
          joins(:user, :report, :campaign).
          joins('LEFT JOIN campaign_users cu ON cu.campaign_id = campaigns.id AND cu.user_id = user_reports.user_id').
          joins('LEFT JOIN clients p ON p.id = campaigns.project_id').
          where('p.id IN (?)', project_ids). # rubocop:disable Rails/WhereEquals
          distinct.
          order('p.id, p.name, campaigns.id, campaigns.name').
          pluck(
            'p.id',
            'p.name',
            'campaigns.id',
            'campaigns.name',
            Arel.sql("concat_ws(' ', users.first_name, users.last_name)"),
            'users.email',
            'reports.id',
            'reports.name',
            'user_reports.created_at',
            'cu.created_at'
          )
      end
    end
  end
end
