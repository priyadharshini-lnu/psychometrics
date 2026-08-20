# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class ProctoringSessionsHandler < BaseHandler
      HEADERS = [
        'Session ID',
        'Client Name',
        'Project Name',
        'Campaign Name',
        'Email',
        'Created At'
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
          fetch_data.each { |row| csv << format_csv_row(row) }
        end
      end

      def self.file_extension
        'csv'
      end

      private

      def fetch_data
        records = ProctoringSession.
                  joins('INNER JOIN campaign_users ON campaign_users.id = proctoring_sessions.campaign_user_id').
                  joins('INNER JOIN users ON users.id = campaign_users.user_id').
                  joins('INNER JOIN campaigns ON campaigns.id = campaign_users.campaign_id').
                  joins('INNER JOIN clients AS projects ON projects.id = campaigns.project_id').
                  joins('INNER JOIN clients ON clients.id = projects.tte_id')

        records = records.where(projects: { id: project_ids }) if project_ids.present?

        if geo_restricted_top_level_client_ids.any?
          records = records.where.not(clients: { id: geo_restricted_top_level_client_ids })
        end

        if start_date.present?
          records = records.where(
            'proctoring_sessions.created_at >= ?',
            start_date.beginning_of_day
          )
        end

        if end_date.present?
          records = records.where(
            'proctoring_sessions.created_at < ?',
            end_date.beginning_of_day
          )
        end

        records.
          order('proctoring_sessions.created_at').
          pluck(
            'proctoring_sessions.session_id',
            'clients.name',
            'projects.name',
            'campaigns.name',
            'users.email',
            'proctoring_sessions.created_at'
          )
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
