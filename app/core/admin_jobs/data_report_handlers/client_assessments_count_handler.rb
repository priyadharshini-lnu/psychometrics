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

        query = query.where(c: { id: client_ids }) if client_ids.present?

        if year_range.present?
          start_date = Date.new(year_range[0].to_i, 1, 1)
          end_date   = Date.new(year_range[1].to_i, 12, 31).end_of_day

          query = query.where(completed_at: start_date..end_date)
        end

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
            row.year,
            row.count,
            row.proctored_count
          ]
        end
      end
    end
  end
end
