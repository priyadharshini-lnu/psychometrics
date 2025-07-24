# frozen_string_literal: true

class AddCampaignFactorGroupToBiModels < ActiveRecord::Migration[7.1]
  def up
    # update campaign_factors to have campaign_factor_group_id
    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaign_factors;

      CREATE VIEW bi_models.campaign_factors AS
      SELECT
        campaign_factors.id,
        campaigns.project_id,
        campaign_factors.campaign_id,
        campaign_factors.name,
        campaign_factors.code,
        campaign_factors.campaign_factor_group_id,
        CASE campaign_factors.factor_type
          WHEN 1 THEN 'assessment'
          WHEN 2 THEN 'assessor_scoring'
          WHEN 3 THEN 'formula'
          WHEN 4 THEN 'external_score'
        END AS factor_type,
        CASE campaign_factors.output_type
          WHEN 0 THEN 'numeric'
          WHEN 1 THEN 'string'
        END AS output_type
      FROM
        campaign_factors
        JOIN campaigns ON campaigns.id = campaign_factors.campaign_id
    SQL

    # create campaign_factor_group view
    execute <<-SQL.squish
      CREATE OR REPLACE VIEW bi_models.campaign_factor_group AS
      SELECT
        id,
        campaign_id,
        name,
        position
      FROM
        campaign_factor_groups
    SQL
  end
end
