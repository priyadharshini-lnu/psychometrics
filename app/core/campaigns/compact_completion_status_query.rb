# frozen_string_literal: true

module Campaigns
  class CompactCompletionStatusQuery < Rectify::Query
    private_attr_reader :campaign_id

    def initialize(campaign_id)
      @campaign_id = campaign_id
    end

    def query
      sql = <<-SQL.strip_heredoc
            SELECT * FROM crosstab(
              'SELECT DISTINCT u.email "Email", u.first_name "First Name", u.last_name "Last Name", a."name" "Assessment",
                CASE
                  #{status_case_statement_sql}
                END
                "Status" from user_assessments ua INNER JOIN assessments a ON a.id = ua.assessment_id INNER JOIN users u ON ua.subject_id = u.id
                WHERE campaign_id = #{campaign_id} AND ua.subject_id = ua.evaluator_id',
                'SELECT DISTINCT a."name" FROM user_assessments ua INNER JOIN assessments a ON ua.assessment_id = a.id
                WHERE campaign_id = #{campaign_id} AND ua.subject_id = ua.evaluator_id ORDER BY a.name'
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
      default_column_names.concat(assessment_names).map do |name|
        "\"#{name}\" text"
      end.join(', ')
    end

    def default_column_names
      ['Email', 'First Name', 'Last Name']
    end

    def assessment_names
      @assessment_names ||= Assessment.joins(:user_assessments).where(
        'user_assessments.campaign_id = :campaign_id AND user_assessments.subject_id = user_assessments.evaluator_id',
        campaign_id: campaign_id
      ).pluck(:name).sort.uniq
    end
  end
end
