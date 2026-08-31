# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class PearsonUsageHandler < BaseHandler
      HEADERS = [
        'Assessment ID',
        'Assessment Name',
        'Status',
        'Started At',
        'Completed At',
        'Assigned At',
        'Report ID',
        'Report Name',
        'Project ID',
        'Project Name',
        'Campaign ID',
        'Campaign Name',
        'Subject Name',
        'Subject Email'
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
        records = UserAssessment.
                  joins(:assessment).
                  joins('LEFT JOIN users u ON u.id = user_assessments.subject_id').
                  joins('LEFT JOIN campaigns cmp ON cmp.id = user_assessments.campaign_id').
                  joins('LEFT JOIN clients p ON p.id = cmp.project_id').
                  joins('LEFT JOIN clients c ON c.id = p.tte_id').
                  joins(
                    'LEFT JOIN assessments_reports ar ' \
                    'ON ar.assessment_id = user_assessments.assessment_id'
                  ).
                  joins(<<~SQL.squish).
                    LEFT JOIN user_reports ur
                      ON ur.user_id = user_assessments.subject_id
                     AND ur.campaign_id = user_assessments.campaign_id
                     AND ur.report_id = ar.report_id
                  SQL
                  joins('LEFT JOIN reports r ON r.id = ur.report_id').
                  where(
                    assessments: {
                      category: Assessment::CATEGORIES[:pearson]
                    }
                  ).
                  where(
                    r: {
                      provider: Report.providers[:pearson]
                    }
                  ).
                  where('u.is_uat = false')

        records = records.where(p: { id: project_ids }) if project_ids.present?

        if geo_restricted_top_level_client_ids.any?
          records = records.where.not(c: { id: geo_restricted_top_level_client_ids })
        end

        records = records.where(user_assessments: { completed_at: completed_at_range }) if completed_at_range

        records.
          where.not(r: { id: nil }).
          group(
            'assessments.id',
            'assessments.name',
            'user_assessments.status',
            'user_assessments.started_at',
            'user_assessments.completed_at',
            'user_assessments.created_at',
            'r.id',
            'r.name',
            'p.id',
            'p.name',
            'cmp.id',
            'cmp.name',
            'u.first_name',
            'u.last_name',
            'u.email'
          ).
          order(
            'p.id',
            'cmp.id',
            'assessments.id'
          ).
          pluck(
            'assessments.id',
            'assessments.name',
            Arel.sql(<<~SQL.squish),
              CASE user_assessments.status
                WHEN 0 THEN 'Not Started'
                WHEN 1 THEN 'In Progress'
                WHEN 2 THEN 'Completed'
                WHEN 3 THEN 'Interrupted'
                WHEN 4 THEN 'Timed Out'
                WHEN 5 THEN 'Ineligible'
              END
            SQL
            'user_assessments.started_at',
            'user_assessments.completed_at',
            'user_assessments.created_at',
            'r.id',
            'r.name',
            'p.id',
            'p.name',
            'cmp.id',
            'cmp.name',
            Arel.sql("u.first_name || ' ' || u.last_name"),
            'u.email'
          )
      end

      def completed_at_range
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
