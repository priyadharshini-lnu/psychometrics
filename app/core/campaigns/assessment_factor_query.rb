# frozen_string_literal: true

module Campaigns
  class AssessmentFactorQuery < Rectify::Query
    private_attr_reader :campaign_id

    def initialize(campaign_id)
      @campaign_id = campaign_id
    end

    def query
      ActiveRecord::Base.connection.execute(sql)
    end

    def sql
      <<-SQL.squish
        SELECT DISTINCT
          f.id AS factor_id
        FROM
          factors f
          INNER JOIN dimensions d ON f.dimension_id = d.id
          INNER JOIN assessments a ON a.dimension_id = d.id
        WHERE
          a.id IN (
            SELECT assessment_id FROM campaign_assessor_assessments
            WHERE campaign_id = #{campaign_id}
            UNION
            SELECT assessment_id FROM campaign_assessments
            WHERE campaign_id = #{campaign_id}
          )
      SQL
    end
  end
end
