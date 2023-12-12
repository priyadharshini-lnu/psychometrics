# frozen_string_literal: true

module Campaigns
  class AssessorFactor < Rectify::Query
    private_attr_reader :campaign_id, :campaign_factor_group_id

    def initialize(campaign_id, campaign_factor_group_id)
      @campaign_id = campaign_id
      @campaign_factor_group_id = campaign_factor_group_id
    end

    def query
      ActiveRecord::Base.connection.execute(sql)
    end

    def sql
      <<-SQL.squish
        SELECT DISTINCT
          f.id,
          #{campaign_factor_group_id} AS campaign_factor_group_id,
          f.name,
          REGEXP_REPLACE(LOWER(f.name), '\\W+', '_', 'gi') AS code,
          #{CampaignFactor.factor_types[:assessor_scoring]} AS factor_type,
          #{campaign_id} AS campaign_id,
          ROW_NUMBER () OVER () AS position
        FROM
          factors f
          INNER JOIN dimensions d ON f.dimension_id = d.id
          INNER JOIN assessments a ON a.dimension_id = d.id
          INNER JOIN factors_scoring fs ON fs.assessment_id = a.id
            AND fs.factor_id = f.id
        WHERE
          a.id IN(
            SELECT DISTINCT
              assessment_id FROM campaign_assessor_assessments
            WHERE
              campaign_id = #{campaign_id}
          )
      SQL
    end
  end
end
