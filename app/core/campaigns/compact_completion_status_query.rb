# frozen_string_literal: true

module Campaigns
  class CompactCompletionStatusQuery < Rectify::Query
    private_attr_reader :campaign_id

    DEFAULT_COLUMN_NAMES = ['Email', 'First Name', 'Last Name'].freeze

    def initialize(campaign_id)
      @campaign_id = campaign_id
    end

    def query
      sql = <<-SQL.squish
            SELECT * FROM crosstab(
              'SELECT DISTINCT u.email "Email", u.first_name "First Name", u.last_name "Last Name", a."name" "Assessment",
                CASE
                  #{status_case_statement_sql}
                END
                "Status" from user_assessments ua INNER JOIN assessments a ON a.id = ua.assessment_id INNER JOIN users u ON ua.subject_id = u.id
                WHERE campaign_id = #{campaign_id} AND ua.subject_id = ua.evaluator_id',
                '#{assessment_names_query.to_sql}'
            ) As (
              #{column_names}
            )
      SQL
      ActiveRecord::Base.connection.execute(sql)
    end

    def status_case_statement_sql
      sql = ''
      UserAssessment.statuses.each do |key, value|
        sql += " WHEN ua.status = #{value} THEN ''#{key.titleize}''"
      end
      sql
    end

    def column_names
      [].concat(DEFAULT_COLUMN_NAMES, assessment_names).map do |name|
        "\"#{name.gsub('"', '""')}\" text"
      end.join(', ')
    end

    def assessment_names_query
      Assessment.joins(:user_assessments).where(
        'user_assessments.campaign_id = :campaign_id AND user_assessments.subject_id = user_assessments.evaluator_id',
        campaign_id: campaign_id
      ).select(:name).distinct.order(:name)
    end

    def assessment_names
      @assessment_names ||= assessment_names_query.pluck(:name)
    end
  end
end
