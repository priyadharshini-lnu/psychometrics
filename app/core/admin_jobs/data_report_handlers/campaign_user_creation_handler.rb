# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class CampaignUserCreationHandler < BaseHandler
      HEADERS = [
        'Project Name',
        'Campaign Name',
        'Email',
        'First Name',
        'Last Name',
        'Created At',
        'Completion Status'
      ].freeze

      def generate_file
        CSV.open(file_path, 'wb') do |csv|
          csv << HEADERS
          fetch_data.each do |row|
            csv << row
          end
        end
      end

      def self.file_extension
        'csv'
      end

      private

      def fetch_data
        return [] if project_ids.blank?

        records = CampaignUser.
                  select(
                    'clients.name AS project_name',
                    'campaigns.name AS campaign_name',
                    'users.email',
                    'users.first_name',
                    'users.last_name',
                    'campaign_users.created_at',
                    'campaign_users.completion_status'
                  ).
                  joins(:campaign).
                  joins('INNER JOIN clients ON clients.id = campaigns.project_id').
                  joins(:user).
                  where(campaigns: { project_id: project_ids })

        if start_date.present? && end_date.present?
          records = records.where(
            'campaign_users.created_at BETWEEN ? AND ?',
            start_date.beginning_of_day,
            end_date.end_of_day
          )
        end

        records.
          order('clients.name, campaigns.name, users.email').
          map do |record|
            [
              record.project_name,
              record.campaign_name,
              record.email,
              record.first_name,
              record.last_name,
              record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
              format_completion_status(record.completion_status)
            ]
          end
      end

      def format_completion_status(status)
        case status
          when 0, 'not_started' then 'Not Started'
          when 1, 'in_progress' then 'In Progress'
          when 2, 'completed' then 'Completed'
          else ''
        end
      end

      def start_date
        config['start_date'].presence&.to_date
      end

      def end_date
        config['end_date'].presence&.to_date
      end
    end
  end
end
