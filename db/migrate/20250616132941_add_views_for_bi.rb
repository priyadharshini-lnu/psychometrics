# frozen_string_literal: true

class AddViewsForBi < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL.squish
      DROP SCHEMA IF EXISTS bi_models CASCADE;
      CREATE SCHEMA bi_models;
    SQL

    # users view
    execute <<-SQL.squish
      CREATE VIEW bi_models.users AS
      Select id, project_id, first_name, last_name, email from users
    SQL

    # user_assessments view
    execute <<-SQL.squish
      CREATE VIEW bi_models.user_assessments AS
      SELECT
        user_assessments.id,
        campaigns.project_id,
        campaign_id,
        assessment_id,
        subject_id,
        evaluator_id,
        relationship_id,
        user_assessments.status,
        started_at,
        completed_at
      FROM
        user_assessments
        JOIN campaigns ON campaigns.id = user_assessments.campaign_id
    SQL

    # relationships view
    execute <<-SQL.squish
      CREATE VIEW bi_models.relationships AS
      SELECT
        relationships.id,
        campaigns.project_id,
        relationships.campaign_id,
        relationships.name,
        CASE relationships.type
          WHEN 0 THEN 'global'
          WHEN 1 THEN 'campaign'
        END AS type
      FROM
        relationships
        JOIN campaigns ON campaigns.id = relationships.campaign_id
    SQL

    # campaigns view
    execute <<-SQL.squish
      CREATE VIEW bi_models.campaigns AS
      SELECT id, name, project_id FROM campaigns
    SQL

    # assessments view
    execute <<-SQL.squish
      CREATE VIEW bi_models.assessments AS
      SELECT id, name, category FROM assessments
    SQL

    # normalized_factor_scores
    execute <<-SQL.squish
      CREATE VIEW bi_models.normalized_factor_scores AS
        SELECT
          user_assessment_factor_scores.id,
          campaigns.project_id,
          campaigns.id as campaign_id,
          user_assessment_factor_scores.user_assessment_id,
          user_assessment_factor_scores.factor_id,
          (user_assessment_factor_scores.scores ->> 'norm_score')::float AS norm_score,
          (user_assessment_factor_scores.scores ->> 'score')::float AS score,
          (user_assessment_factor_scores.scores ->> 'zscore')::float AS zscore,
          (user_assessment_factor_scores.scores ->> 'percentage')::float AS percentage
        FROM
          user_assessment_factor_scores
          JOIN user_assessments ON user_assessments.id = user_assessment_factor_scores.user_assessment_id
          JOIN campaigns ON campaigns.id = user_assessments.campaign_id
    SQL

    # Factors view
    execute <<-SQL.squish
      CREATE VIEW bi_models.factors AS
      SELECT id, name FROM factors
    SQL

    # campaign_factor_values view
    execute <<-SQL.squish
      CREATE VIEW bi_models.campaign_factor_values AS
      SELECT
        campaign_factor_values.id,
        campaigns.project_id,
        campaigns.id as campaign_id,
        campaign_factor_id,
        user_id,
        string_value,
        numeric_value
      FROM
        campaign_factor_values
        JOIN campaigns ON campaigns.id = campaign_factor_values.campaign_id
    SQL

    # campaign_factors view
    execute <<-SQL.squish
      CREATE VIEW bi_models.campaign_factors AS
      SELECT
        campaign_factors.id,
        campaigns.project_id,
        campaign_factors.campaign_id,
        campaign_factors.name,
        campaign_factors.code,
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

    # datasheets view
    execute <<-SQL.squish
      CREATE VIEW bi_models.datasheets AS
      SELECT
        sheet_rows.id,
        COALESCE(sheets.project_id, campaigns.project_id) as project_id,
        sheets.campaign_id AS campaign_id,
        sheet_rows.email AS email,
        sheet_columns.name AS field_name,
        sheet_row_data.numeric_value AS "numeric_value",
        sheet_row_data.string_value AS "string_value"
      FROM
        sheet_row_data
        JOIN sheet_rows ON sheet_rows.id = sheet_row_data.sheet_row_id
        JOIN sheets ON sheets.id = sheet_rows.sheet_id
        JOIN sheet_columns ON sheet_columns.sheet_id = sheets.id
        LEFT JOIN campaigns ON campaigns.id = sheets.campaign_id
      WHERE
        sheets.type = 'Datasheet'
    SQL

    # profile_fields_values view
    execute <<-SQL.squish
      CREATE VIEW bi_models.profile_fields_values AS
      SELECT
        profile_settings.project_id,
        user_profiles.user_id,
        questions."name" as field_name,
        profile_field_values.numeric_value,
        profile_field_values.string_value
      FROM
        profile_settings
        INNER JOIN profile_fields ON profile_fields.profile_setting_id = profile_settings.id
        INNER JOIN questions ON questions.id = profile_fields.question_id
        INNER JOIN profile_field_values ON profile_field_values.profile_field_id = profile_fields.id
        INNER JOIN user_profiles ON user_profiles.id = profile_field_values.user_profile_id
    SQL
  end

  def down
    execute <<-SQL.squish
      DROP SCHEMA IF EXISTS bi_models CASCADE;
    SQL
  end
end
