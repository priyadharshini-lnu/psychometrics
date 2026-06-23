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
        records = UserAssessment.
                  joins(:assessment).
                  joins('LEFT JOIN users u ON u.id = user_assessments.subject_id').
                  joins('LEFT JOIN campaigns cmp ON cmp.id = user_assessments.campaign_id').
                  joins('LEFT JOIN clients p ON p.id = cmp.project_id').
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
                  )

        records = records.where(p: { id: project_ids }) if project_ids.present?

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
            Arel.sql("TO_CHAR(user_assessments.started_at, 'YYYY-MM-DD HH24:MI:SS TZHTZM')"),
            Arel.sql("TO_CHAR(user_assessments.completed_at, 'YYYY-MM-DD HH24:MI:SS TZHTZM')"),
            Arel.sql("TO_CHAR(user_assessments.created_at, 'YYYY-MM-DD HH24:MI:SS TZHTZM')"),
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
    end
  end
end
