# frozen_string_literal: true

class AddAllowDataAccessToBiToClients < ActiveRecord::Migration[8.0]
  def up
    add_column :clients, :allow_data_access_to_bi, :boolean, null: false, default: false

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaigns;

      CREATE VIEW bi_models.campaigns AS
      SELECT
        campaigns.id,
        campaigns.name,
        campaigns.project_id
      FROM public.campaigns
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.users;

      CREATE VIEW bi_models.admin_users AS
      SELECT
        id,
        first_name,
        last_name,
        email
      FROM public.users
      WHERE project_id IS NULL;

      CREATE VIEW bi_models.end_users AS
      SELECT
        users.id,
        users.project_id,
        users.first_name,
        users.last_name,
        users.email
      FROM public.users
      JOIN public.clients bi_projects
        ON bi_projects.id = users.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaign_factor_values;

      CREATE VIEW bi_models.campaign_factor_values AS
      SELECT
        campaign_factor_values.id,
        campaigns.project_id,
        campaigns.id AS campaign_id,
        campaign_factor_values.campaign_factor_id,
        campaign_factor_values.user_id,
        campaign_factor_values.string_value,
        campaign_factor_values.numeric_value
      FROM public.campaign_factor_values
      JOIN public.campaigns
        ON campaigns.id = campaign_factor_values.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

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
          WHEN 1 THEN 'assessment'::text
          WHEN 2 THEN 'assessor_scoring'::text
          WHEN 3 THEN 'formula'::text
          WHEN 4 THEN 'external_score'::text
          ELSE NULL::text
        END AS factor_type,
        CASE campaign_factors.output_type
          WHEN 0 THEN 'numeric'::text
          WHEN 1 THEN 'string'::text
          ELSE NULL::text
        END AS output_type
      FROM public.campaign_factors
      JOIN public.campaigns
        ON campaigns.id = campaign_factors.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaign_factor_group;

      CREATE VIEW bi_models.campaign_factor_group AS
      SELECT
        campaign_factor_groups.id,
        campaigns.project_id,
        campaign_factor_groups.campaign_id,
        campaign_factor_groups.name,
        campaign_factor_groups."position"
      FROM public.campaign_factor_groups
      JOIN public.campaigns
        ON campaigns.id = campaign_factor_groups.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.datasheets;

      CREATE VIEW bi_models.datasheets AS
      SELECT
        sheet_rows.id,
        COALESCE(sheets.project_id, campaigns.project_id) AS project_id,
        sheets.campaign_id,
        sheet_rows.email,
        sheet_columns.name AS field_name,
        sheet_row_data.numeric_value,
        sheet_row_data.string_value
      FROM public.sheet_row_data
      JOIN public.sheet_rows
        ON sheet_rows.id = sheet_row_data.sheet_row_id
      JOIN public.sheets
        ON sheets.id = sheet_rows.sheet_id
      JOIN public.sheet_columns
        ON sheet_columns.sheet_id = sheets.id
      LEFT JOIN public.campaigns
        ON campaigns.id = sheets.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = COALESCE(sheets.project_id, campaigns.project_id)
        AND bi_projects.allow_data_access_to_bi
      WHERE (sheets.type)::text = 'Datasheet'::text;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.normalized_factor_scores;

      CREATE VIEW bi_models.normalized_factor_scores AS
      SELECT
        user_assessment_factor_scores.id,
        campaigns.project_id,
        campaigns.id AS campaign_id,
        user_assessment_factor_scores.user_assessment_id,
        user_assessment_factor_scores.factor_id,
        ((user_assessment_factor_scores.scores ->> 'norm_score'::text))::double precision AS norm_score,
        ((user_assessment_factor_scores.scores ->> 'score'::text))::double precision AS score,
        ((user_assessment_factor_scores.scores ->> 'zscore'::text))::double precision AS zscore,
        ((user_assessment_factor_scores.scores ->> 'percentage'::text))::double precision AS percentage,
        ((user_assessment_factor_scores.scores ->> 'total_questions'::text))::integer AS total_questions,
        ((user_assessment_factor_scores.scores ->> 'questions_attempted'::text))::integer AS questions_attempted,
        ((user_assessment_factor_scores.scores ->> 'questions_correct'::text))::integer AS questions_correct,
        ((user_assessment_factor_scores.scores ->> 'questions_partial_correct'::text))::integer AS questions_partial_correct,
        ((user_assessment_factor_scores.scores ->> 'questions_incorrect'::text))::integer AS questions_incorrect,
        ((user_assessment_factor_scores.scores ->> 'questions_not_attempted'::text))::integer AS questions_not_attempted
      FROM public.user_assessment_factor_scores
      JOIN public.user_assessments
        ON user_assessments.id = user_assessment_factor_scores.user_assessment_id
      JOIN public.campaigns
        ON campaigns.id = user_assessments.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.profile_fields_values;

      CREATE VIEW bi_models.profile_fields_values AS
      SELECT
        profile_settings.project_id,
        user_profiles.user_id,
        questions.name AS field_name,
        profile_field_values.numeric_value,
        profile_field_values.string_value
      FROM public.profile_settings
      JOIN public.profile_fields
        ON profile_fields.profile_setting_id = profile_settings.id
      JOIN public.questions
        ON questions.id = profile_fields.question_id
      JOIN public.profile_field_values
        ON profile_field_values.profile_field_id = profile_fields.id
      JOIN public.user_profiles
        ON user_profiles.id = profile_field_values.user_profile_id
      JOIN public.clients bi_projects
        ON bi_projects.id = profile_settings.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.relationships;

      CREATE VIEW bi_models.relationships AS
      SELECT
        relationships.id,
        campaigns.project_id,
        relationships.campaign_id,
        relationships.name,
        CASE relationships.type
          WHEN 0 THEN 'global'::text
          WHEN 1 THEN 'campaign'::text
          ELSE NULL::text
        END AS type
      FROM public.relationships
      JOIN public.campaigns
        ON campaigns.id = relationships.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.user_assessments;

      CREATE VIEW bi_models.user_assessments AS
      SELECT
        user_assessments.id,
        campaigns.project_id,
        user_assessments.campaign_id,
        user_assessments.assessment_id,
        user_assessments.subject_id,
        user_assessments.evaluator_id,
        user_assessments.relationship_id,
        user_assessments.status,
        user_assessments.started_at,
        user_assessments.completed_at
      FROM public.user_assessments
      JOIN public.campaigns
        ON campaigns.id = user_assessments.campaign_id
      JOIN public.clients bi_projects
        ON bi_projects.id = campaigns.project_id
        AND bi_projects.allow_data_access_to_bi;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.projects;

      CREATE VIEW bi_models.projects AS
      SELECT
        id,
        name,
        tte_id AS client_id
      FROM public.clients
      WHERE ancestry_depth = 1
        AND allow_data_access_to_bi;
    SQL
  end

  def down
    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaigns;

      CREATE VIEW bi_models.campaigns AS
      SELECT id, name, project_id
      FROM public.campaigns;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.admin_users;
      DROP VIEW IF EXISTS bi_models.end_users;

      CREATE VIEW bi_models.users AS
      SELECT id, project_id, first_name, last_name, email
      FROM public.users;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaign_factor_values;

      CREATE VIEW bi_models.campaign_factor_values AS
      SELECT
        campaign_factor_values.id,
        campaigns.project_id,
        campaigns.id AS campaign_id,
        campaign_factor_values.campaign_factor_id,
        campaign_factor_values.user_id,
        campaign_factor_values.string_value,
        campaign_factor_values.numeric_value
      FROM (public.campaign_factor_values
        JOIN public.campaigns ON ((campaigns.id = campaign_factor_values.campaign_id)));
    SQL

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
          WHEN 1 THEN 'assessment'::text
          WHEN 2 THEN 'assessor_scoring'::text
          WHEN 3 THEN 'formula'::text
          WHEN 4 THEN 'external_score'::text
          ELSE NULL::text
        END AS factor_type,
        CASE campaign_factors.output_type
          WHEN 0 THEN 'numeric'::text
          WHEN 1 THEN 'string'::text
          ELSE NULL::text
        END AS output_type
      FROM (public.campaign_factors
        JOIN public.campaigns ON ((campaigns.id = campaign_factors.campaign_id)));
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.campaign_factor_group;

      CREATE VIEW bi_models.campaign_factor_group AS
      SELECT id, campaign_id, name, "position"
      FROM public.campaign_factor_groups;
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.datasheets;

      CREATE VIEW bi_models.datasheets AS
      SELECT
        sheet_rows.id,
        COALESCE(sheets.project_id, campaigns.project_id) AS project_id,
        sheets.campaign_id,
        sheet_rows.email,
        sheet_columns.name AS field_name,
        sheet_row_data.numeric_value,
        sheet_row_data.string_value
      FROM ((((public.sheet_row_data
        JOIN public.sheet_rows ON ((sheet_rows.id = sheet_row_data.sheet_row_id)))
        JOIN public.sheets ON ((sheets.id = sheet_rows.sheet_id)))
        JOIN public.sheet_columns ON ((sheet_columns.sheet_id = sheets.id)))
        LEFT JOIN public.campaigns ON ((campaigns.id = sheets.campaign_id)))
      WHERE ((sheets.type)::text = 'Datasheet'::text);
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.normalized_factor_scores;

      CREATE VIEW bi_models.normalized_factor_scores AS
      SELECT
        user_assessment_factor_scores.id,
        campaigns.project_id,
        campaigns.id AS campaign_id,
        user_assessment_factor_scores.user_assessment_id,
        user_assessment_factor_scores.factor_id,
        ((user_assessment_factor_scores.scores ->> 'norm_score'::text))::double precision AS norm_score,
        ((user_assessment_factor_scores.scores ->> 'score'::text))::double precision AS score,
        ((user_assessment_factor_scores.scores ->> 'zscore'::text))::double precision AS zscore,
        ((user_assessment_factor_scores.scores ->> 'percentage'::text))::double precision AS percentage,
        ((user_assessment_factor_scores.scores ->> 'total_questions'::text))::integer AS total_questions,
        ((user_assessment_factor_scores.scores ->> 'questions_attempted'::text))::integer AS questions_attempted,
        ((user_assessment_factor_scores.scores ->> 'questions_correct'::text))::integer AS questions_correct,
        ((user_assessment_factor_scores.scores ->> 'questions_partial_correct'::text))::integer AS questions_partial_correct,
        ((user_assessment_factor_scores.scores ->> 'questions_incorrect'::text))::integer AS questions_incorrect,
        ((user_assessment_factor_scores.scores ->> 'questions_not_attempted'::text))::integer AS questions_not_attempted
      FROM ((public.user_assessment_factor_scores
        JOIN public.user_assessments ON ((user_assessments.id = user_assessment_factor_scores.user_assessment_id)))
        JOIN public.campaigns ON ((campaigns.id = user_assessments.campaign_id)));
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.profile_fields_values;

      CREATE VIEW bi_models.profile_fields_values AS
      SELECT
        profile_settings.project_id,
        user_profiles.user_id,
        questions.name AS field_name,
        profile_field_values.numeric_value,
        profile_field_values.string_value
      FROM ((((public.profile_settings
        JOIN public.profile_fields ON ((profile_fields.profile_setting_id = profile_settings.id)))
        JOIN public.questions ON ((questions.id = profile_fields.question_id)))
        JOIN public.profile_field_values ON ((profile_field_values.profile_field_id = profile_fields.id)))
        JOIN public.user_profiles ON ((user_profiles.id = profile_field_values.user_profile_id)));
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.relationships;

      CREATE VIEW bi_models.relationships AS
      SELECT
        relationships.id,
        campaigns.project_id,
        relationships.campaign_id,
        relationships.name,
        CASE relationships.type
          WHEN 0 THEN 'global'::text
          WHEN 1 THEN 'campaign'::text
          ELSE NULL::text
        END AS type
      FROM (public.relationships
        JOIN public.campaigns ON ((campaigns.id = relationships.campaign_id)));
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.user_assessments;

      CREATE VIEW bi_models.user_assessments AS
      SELECT
        user_assessments.id,
        campaigns.project_id,
        user_assessments.campaign_id,
        user_assessments.assessment_id,
        user_assessments.subject_id,
        user_assessments.evaluator_id,
        user_assessments.relationship_id,
        user_assessments.status,
        user_assessments.started_at,
        user_assessments.completed_at
      FROM (public.user_assessments
        JOIN public.campaigns ON ((campaigns.id = user_assessments.campaign_id)));
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.projects;

      CREATE VIEW bi_models.projects AS
      SELECT id, name, tte_id AS client_id
      FROM public.clients
      WHERE ancestry_depth = 1;
    SQL

    remove_column :clients, :allow_data_access_to_bi
  end
end
