# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class ActiveClientsProjectsHandler < BaseHandler
      HEADERS = [
        'Client ID',
        'Client Name',
        'Project ID',
        'Project Name',
        'Last Activity Date (MAX last_activity_at)'
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
        start_date = Time.zone.parse(activity_period[0])
        end_date = Time.zone.parse(activity_period[1])

        UserAssessment.
          from('user_assessments ua').
          joins('LEFT JOIN campaigns cmp ON ua.campaign_id = cmp.id').
          joins('LEFT JOIN assessments a ON a.id = ua.assessment_id').
          joins('LEFT JOIN clients p ON cmp.project_id = p.id').
          joins('LEFT JOIN clients c ON c.id = p.tte_id').
          where('p.ancestry_depth = ? AND c.ancestry_depth = ?', 1, 0).
          select(
            'c.id AS client_id',
            'c.name AS client_name',
            'p.id AS project_id',
            'p.name AS project_name',
            'MAX(ua.last_activity_at) AS last_activity_date'
          ).
          group('c.id, c.name, p.id, p.name').
          having('MAX(ua.last_activity_at) BETWEEN ? AND ?', start_date, end_date).
          order('c.id, c.name, p.id, p.name').
          map do |row|
            [
              row.client_id,
              row.client_name,
              row.project_id,
              row.project_name,
              row.last_activity_date
            ]
          end
      end
    end
  end
end
