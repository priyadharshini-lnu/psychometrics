# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class ClientAssessmentsCountHandler < BaseHandler
      HEADERS = [
        'Client ID',
        'Client Name',
        'Year',
        'Count (total completed assessments)',
        'Proctored Count (assessments with proctoring enabled)'
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
        query = UserAssessment.
                joins(<<~SQL.squish).
                  LEFT JOIN campaigns cmp ON user_assessments.campaign_id = cmp.id
                  LEFT JOIN campaign_options co ON co.campaign_id = cmp.id
                  LEFT JOIN clients p ON cmp.project_id = p.id
                  LEFT JOIN clients c ON c.id = p.tte_id
                SQL
                where('p.ancestry_depth = 1').
                where('c.ancestry_depth = 0').
                where(status: [2, 3, 4, 5])

        if geo_restricted_top_level_client_ids.any?
          query = query.where.not(c: { id: geo_restricted_top_level_client_ids })
        end

        query = query.where(c: { id: client_ids }) if client_ids.present?
        query = query.where(completed_at: completed_at_range) if completed_at_range

        query = query.select(Arel.sql(%(
          c.id AS client_id,
          c.name AS client_name,
          DATE_PART('year', user_assessments.completed_at) AS year,
          COUNT(*) AS count,
          COUNT(*) FILTER (WHERE co.proctoring_enabled = TRUE) AS proctored_count
        )))

        query = query.group(
          Arel.sql('c.id'),
          Arel.sql('c.name'),
          Arel.sql("DATE_PART('year', user_assessments.completed_at)")
        ).order(
          Arel.sql('c.id'),
          Arel.sql('c.name'),
          Arel.sql("DATE_PART('year', user_assessments.completed_at)")
        )

        query.map do |row|
          [
            row.client_id,
            row.client_name,
            row.year.to_i,
            row.count,
            row.proctored_count
          ]
        end
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
