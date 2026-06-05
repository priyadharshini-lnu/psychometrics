# frozen_string_literal: true

# Backfill and verify tenant_id for all scoped tables.

def green(text) = "\e[32m#{text}\e[0m"
def red(text)   = "\e[31m#{text}\e[0m"
def yellow(text) = "\e[33m#{text}\e[0m"

# Returns { table:, label:, count:, dry_run: } or { table:, label:, error: }
# rubocop:disable Metrics/ParameterLists
def backfill_in_batches(conn, table, sql_template, batch_size: 10_000, dry_run: false, label: nil, range_table: nil)
  if dry_run
    count = conn.select_value("SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL").to_i
    return { table: table, label: label, count: count, dry_run: true }
  end

  # When a range_table is given we iterate over that table's id range and let
  # the index on the FK column (e.g. user_id, auditable_id) drive the lookup,
  # rather than scanning the full target table row by row.
  source = range_table || table
  min_filter = range_table ? '' : ' WHERE tenant_id IS NULL'
  min_id = conn.select_value("SELECT MIN(id) FROM #{source}#{min_filter}").to_i
  max_id = conn.select_value("SELECT MAX(id) FROM #{source}#{min_filter}").to_i
  total_updated = 0
  current = min_id

  while current <= max_id
    end_id = current + batch_size - 1
    sql    = sql_template.gsub(':start_id', current.to_s).gsub(':end_id', end_id.to_s)
    total_updated += conn.update(sql)
    current = end_id + 1
  end

  { table: table, label: label, count: total_updated, dry_run: false }
rescue StandardError => e
  { table: table, label: label, error: e.message }
end
# rubocop:enable Metrics/ParameterLists

# Returns { table:, label:, count:, dry_run: } or { table:, label:, error: }
def execute_or_count(conn, table, sql, dry_run:, label: nil)
  if dry_run
    count = conn.select_value("SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL").to_i
    { table: table, label: label, count: count, dry_run: true }
  else
    { table: table, label: label, count: conn.update(sql), dry_run: false }
  end
rescue StandardError => e
  { table: table, label: label, error: e.message }
end

def print_backfill_results(results, mode)
  puts "\n=== Backfill#{mode} results ===\n\n"

  results.each do |r|
    label_str = r[:label] ? " (#{r[:label]})" : ''
    name      = "#{r[:table]}#{label_str}"

    if r.key?(:error)
      puts "  #{red('✗')} #{name}  ERROR: #{r[:error]}"
    elsif r[:dry_run]
      puts "  #{name}: #{r[:count]} rows would be updated"
    else
      puts "  #{name}: #{r[:count]} rows updated"
    end
  end

  error_count = results.count { |r| r.key?(:error) }
  puts "\n  #{error_count} error(s)" if error_count.positive?
  puts "\n=== Backfill#{mode} complete ==="
end

namespace :tenant do
  desc 'Backfill tenant_id for all scoped tables (idempotent — skips already-set rows)'
  task backfill: :environment do
    dry_run = ActiveModel::Type::Boolean.new.cast(ENV.fetch('DRY_RUN', nil))
    backfill(dry_run: dry_run)
  end

  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def backfill(dry_run:)
    conn    = ActiveRecord::Base.connection
    mode    = dry_run ? ' [DRY RUN — no changes written]' : ''
    results = []
    errors  = []
    existing_tables = conn.tables

    # -------------------------------------------------------------------------
    # Group 0: clients — fills tenant_id first so all downstream groups can use
    # clients.tenant_id directly instead of deriving from tte_id.
    # -------------------------------------------------------------------------
    clients_root_sql = <<~SQL.squish
      UPDATE clients
      SET tenant_id = id
      WHERE tte_id IS NULL
        AND tenant_id IS NULL
    SQL
    results << execute_or_count(conn, 'clients', clients_root_sql, dry_run: dry_run, label: 'root clients')
    clients_sub_sql = <<~SQL.squish
      UPDATE clients
      SET tenant_id = tte_id
      WHERE tte_id IS NOT NULL
        AND tenant_id IS NULL
    SQL
    results << execute_or_count(conn, 'clients', clients_sub_sql, dry_run: dry_run, label: 'sub-clients')

    # -------------------------------------------------------------------------
    # Group A — Tables with project_id
    # project_id always references a sub-client; uses clients.tenant_id directly.
    # -------------------------------------------------------------------------
    group_a_tables = %w[
      campaigns
      design_settings
      idp_settings
      idp_templates
      integrations
      interview_questions
      job_groups
      job_roles
      mettl_assessments
      mettl_schedule_records
      power_bi_settings
      privacy_settings
      profile_settings
      project_assessments
      project_features
      project_licenses
      registration_settings
      saml_service_providers
      saml_settings
      security_settings
      skill_groups
      skills
      taxonomy_levels
      webhook_subscriptions
    ]

    group_a_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = c.tenant_id
        FROM clients c
        WHERE c.id = #{table}.project_id
          AND #{table}.tenant_id IS NULL
          AND #{table}.project_id IS NOT NULL
          AND c.tte_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # Group A2 — smtp_settings
    # project_id can reference either a project client (use c.tte_id)
    # or a root client (fallback to c.id).
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'smtp_settings', <<~SQL.squish, dry_run: dry_run)
      UPDATE smtp_settings
      SET tenant_id = c.tenant_id
      FROM clients c
      WHERE c.id = smtp_settings.project_id
        AND smtp_settings.tenant_id IS NULL
        AND smtp_settings.project_id IS NOT NULL
        AND c.tenant_id IS NOT NULL
    SQL

    # Sheets — backfill via project_id first, then fallback to campaign_id
    sheets_project_sql = <<~SQL.squish
      UPDATE sheets
      SET tenant_id = c.tenant_id
      FROM clients c
      WHERE c.id = sheets.project_id
        AND sheets.tenant_id IS NULL
        AND sheets.project_id IS NOT NULL
        AND c.tte_id IS NOT NULL
    SQL
    results << execute_or_count(conn, 'sheets', sheets_project_sql, dry_run: dry_run, label: 'via project_id')
    sheets_campaign_sql = <<~SQL.squish
      UPDATE sheets
      SET tenant_id = camp.tenant_id
      FROM campaigns camp
      WHERE camp.id = sheets.campaign_id
        AND sheets.tenant_id IS NULL
        AND sheets.project_id IS NULL
        AND camp.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(conn, 'sheets', sheets_campaign_sql, dry_run: dry_run, label: 'via campaign_id')

    # Sheet sub-tables — backfill via sheet → sheets.tenant_id
    results << execute_or_count(conn, 'sheet_columns', <<~SQL.squish, dry_run: dry_run)
      UPDATE sheet_columns
      SET tenant_id = s.tenant_id
      FROM sheets s
      WHERE s.id = sheet_columns.sheet_id
        AND sheet_columns.tenant_id IS NULL
        AND s.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(conn, 'sheet_rows', <<~SQL.squish, dry_run: dry_run)
      UPDATE sheet_rows
      SET tenant_id = s.tenant_id
      FROM sheets s
      WHERE s.id = sheet_rows.sheet_id
        AND sheet_rows.tenant_id IS NULL
        AND s.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(conn, 'sheet_row_data', <<~SQL.squish, dry_run: dry_run)
      UPDATE sheet_row_data
      SET tenant_id = sr.tenant_id
      FROM sheet_rows sr
      WHERE sr.id = sheet_row_data.sheet_row_id
        AND sheet_row_data.tenant_id IS NULL
        AND sr.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # Group B — Tables with campaign_id (backfill via campaign → project → root)
    # -------------------------------------------------------------------------
    group_b_tables = %w[
      ai_scoring_approval_settings
      assessors
      bulk_reports
      campaign_ai_artifacts
      campaign_assessment_groups
      campaign_assessments
      campaign_assessor_assessment_factor_weights
      campaign_assessor_assessments
      campaign_factor_groups
      campaign_factor_values
      campaign_factors
      campaign_idps
      campaign_options
      campaign_reports
      campaign_users
      dashboards
      factor_benchmark_scores
      registration_codes
      relationships
      report_approval_settings
      sms_invites
      sms_records
      threesixty_campaigns
      threesixty_evaluators
      threesixty_subjects
      user_assessments
      user_idp_plans
      user_reports
      workshop_invites
      workshop_subjects
      workshops
    ]

    # Large tables use batched updates to avoid lock contention
    large_b_tables = %w[campaign_factor_values campaign_users user_assessments user_reports]
    small_b_tables = group_b_tables - large_b_tables

    large_b_tables.each do |table|
      results << backfill_in_batches(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = camp.tenant_id
        FROM campaigns camp
        WHERE camp.id = #{table}.campaign_id
          AND #{table}.tenant_id IS NULL
          AND camp.tenant_id IS NOT NULL
          AND #{table}.id BETWEEN :start_id AND :end_id
      SQL
    end

    small_b_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = camp.tenant_id
        FROM campaigns camp
        WHERE camp.id = #{table}.campaign_id
          AND #{table}.tenant_id IS NULL
          AND camp.tenant_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # Group B2 — Tables with threesixty_campaign_id
    # -------------------------------------------------------------------------
    group_b2_tables = %w[
      threesixty_email_histories
      threesixty_email_schedules
      threesixty_email_templates
      threesixty_instruction_templates
      threesixty_nomination_requirements
      threesixty_options
      threesixty_reminder_histories
    ]

    group_b2_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = tc.tenant_id
        FROM threesixty_campaigns tc
        WHERE tc.id = #{table}.threesixty_campaign_id
          AND #{table}.tenant_id IS NULL
          AND tc.tenant_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # Group C — Memberships
    # client_id points to root client for client_admin, sub-client for other roles.
    # clients.tenant_id handles both correctly in a single pass.
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'memberships', <<~SQL.squish, dry_run: dry_run)
      UPDATE memberships
      SET tenant_id = c.tenant_id
      FROM clients c
      WHERE c.id = memberships.client_id
        AND memberships.tenant_id IS NULL
        AND c.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # Group C2 — data_report_jobs via data_report.owner_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'data_report_jobs', <<~SQL.squish, dry_run: dry_run)
      UPDATE data_report_jobs
      SET tenant_id = c.tenant_id
      FROM data_reports dr
      JOIN clients c ON c.id = dr.owner_id
      WHERE dr.id = data_report_jobs.data_report_id
        AND data_report_jobs.tenant_id IS NULL
        AND c.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # Group D — Tables with indirect foreign keys
    # Uses already-backfilled parent tenant_id where possible for efficiency.
    # -------------------------------------------------------------------------

    # D1: Via user_assessment_id → user_assessments (already has tenant_id)
    group_d1_tables = %w[
      iiht_user_assessments
      mettl_user_assessments
      mhs_user_assessments
      pearson_user_assessments
      saville_user_assessments
      simulation_user_assessments
      skillvue_user_assessments
      yoodli_user_assessments
      user_assessment_factor_scores
      user_assessment_verification_images
      user_assessment_verification_media
    ]

    group_d1_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = ua.tenant_id
        FROM user_assessments ua
        WHERE ua.id = #{table}.user_assessment_id
          AND #{table}.tenant_id IS NULL
          AND ua.tenant_id IS NOT NULL
      SQL
    end

    # D2: communication_emails via communication → client
    # communications.client_id always points to root client, so tenant_id = c.id.
    comm_email_sql = <<~SQL.squish
      UPDATE communication_emails
      SET tenant_id = c.id
      FROM communications comm
      JOIN clients c ON c.id = comm.client_id
      WHERE comm.id = communication_emails.communication_id
        AND communication_emails.tenant_id IS NULL
    SQL
    results << execute_or_count(conn, 'communication_emails', comm_email_sql, dry_run: dry_run)

    results << execute_or_count(conn, 'proctoring_sessions', <<~SQL.squish, dry_run: dry_run)
      UPDATE proctoring_sessions
      SET tenant_id = cu.tenant_id
      FROM campaign_users cu
      WHERE cu.id = proctoring_sessions.campaign_user_id
        AND proctoring_sessions.tenant_id IS NULL
        AND cu.tenant_id IS NOT NULL
    SQL

    # D3: Via workshop_id → workshops (already has tenant_id)
    %w[workshop_assessors workshop_managers workshop_resources].each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = w.tenant_id
        FROM workshops w
        WHERE w.id = #{table}.workshop_id
          AND #{table}.tenant_id IS NULL
          AND w.tenant_id IS NOT NULL
      SQL
    end

    # D4: Via communication_id → communications → clients
    # communications.client_id always points to root client, so tenant_id = c.id.
    %w[communication_cc_users communications_assessments communications_users].each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = c.id
        FROM communications comm
        JOIN clients c ON c.id = comm.client_id
        WHERE comm.id = #{table}.communication_id
          AND #{table}.tenant_id IS NULL
      SQL
    end

    # D5: Via user_idp_plan_id → user_idp_plans (already has tenant_id)
    %w[
      idp_report_pdfs
      user_idp_comments
      user_idp_development_actions
      user_idp_skills
      user_reflection_question_answers
    ].each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = uip.tenant_id
        FROM user_idp_plans uip
        WHERE uip.id = #{table}.user_idp_plan_id
          AND #{table}.tenant_id IS NULL
          AND uip.tenant_id IS NOT NULL
      SQL
    end

    # D6: Via user_report_id → user_reports (already has tenant_id)
    results << execute_or_count(conn, 'user_report_pdfs', <<~SQL.squish, dry_run: dry_run)
      UPDATE user_report_pdfs
      SET tenant_id = ur.tenant_id
      FROM user_reports ur
      WHERE ur.id = user_report_pdfs.user_report_id
        AND user_report_pdfs.tenant_id IS NULL
        AND ur.tenant_id IS NOT NULL
    SQL

    # D7 (depends on D12): users_results via user_assessments must run first
    results << execute_or_count(conn, 'users_results', <<~SQL.squish, dry_run: dry_run)
      UPDATE users_results
      SET tenant_id = ua.tenant_id
      FROM user_assessments ua
      WHERE ua.users_result_id = users_results.id
        AND users_results.tenant_id IS NULL
        AND ua.tenant_id IS NOT NULL
    SQL

    results << backfill_in_batches(conn, 'media_responses', <<~SQL.squish, dry_run: dry_run)
      UPDATE media_responses
      SET tenant_id = ur.tenant_id
      FROM users_results ur
      WHERE ur.id = media_responses.users_result_id
        AND media_responses.tenant_id IS NULL
        AND ur.tenant_id IS NOT NULL
        AND media_responses.id BETWEEN :start_id AND :end_id
    SQL

    # D8: Via campaign_idp_id → campaign_idps (already has tenant_id)
    results << execute_or_count(conn, 'campaign_idp_dependencies', <<~SQL.squish, dry_run: dry_run)
      UPDATE campaign_idp_dependencies
      SET tenant_id = ci.tenant_id
      FROM campaign_idps ci
      WHERE ci.id = campaign_idp_dependencies.campaign_idp_id
        AND campaign_idp_dependencies.tenant_id IS NULL
        AND ci.tenant_id IS NOT NULL
    SQL

    # D9: sms_histories via sms_record_id → sms_records (already has tenant_id)
    results << execute_or_count(conn, 'sms_histories', <<~SQL.squish, dry_run: dry_run)
      UPDATE sms_histories
      SET tenant_id = sr.tenant_id
      FROM sms_records sr
      WHERE sr.id = sms_histories.sms_record_id
        AND sms_histories.tenant_id IS NULL
        AND sr.tenant_id IS NOT NULL
    SQL

    # D10: workshop_invite_logs via workshop_invite_id → workshop_invites (already has tenant_id)
    results << execute_or_count(conn, 'workshop_invite_logs', <<~SQL.squish, dry_run: dry_run)
      UPDATE workshop_invite_logs
      SET tenant_id = wi.tenant_id
      FROM workshop_invites wi
      WHERE wi.id = workshop_invite_logs.workshop_invite_id
        AND workshop_invite_logs.tenant_id IS NULL
        AND wi.tenant_id IS NOT NULL
    SQL

    # D11: Via user_report_id → user_reports (already has tenant_id)
    %w[text_module_overrides user_report_comments user_report_events].each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = ur.tenant_id
        FROM user_reports ur
        WHERE ur.id = #{table}.user_report_id
          AND #{table}.tenant_id IS NULL
          AND ur.tenant_id IS NOT NULL
      SQL
    end

    # D12: workshop_invited_subjects via workshop_invite_id → workshop_invites (already has tenant_id)
    results << execute_or_count(conn, 'workshop_invited_subjects', <<~SQL.squish, dry_run: dry_run)
      UPDATE workshop_invited_subjects
      SET tenant_id = wi.tenant_id
      FROM workshop_invites wi
      WHERE wi.id = workshop_invited_subjects.workshop_invite_id
        AND workshop_invited_subjects.tenant_id IS NULL
        AND wi.tenant_id IS NOT NULL
    SQL

    # D13: ai_factor_scores via users_result_id → users_results (already backfilled above)
    results << execute_or_count(conn, 'ai_factor_scores', <<~SQL.squish, dry_run: dry_run)
      UPDATE ai_factor_scores
      SET tenant_id = ur.tenant_id
      FROM users_results ur
      WHERE ur.id = ai_factor_scores.users_result_id
        AND ai_factor_scores.tenant_id IS NULL
        AND ur.tenant_id IS NOT NULL
    SQL

    # D14: campaign_ai_artifact_dependencies via campaign_ai_artifact_id
    results << execute_or_count(conn, 'campaign_ai_artifact_dependencies', <<~SQL.squish, dry_run: dry_run)
      UPDATE campaign_ai_artifact_dependencies
      SET tenant_id = art.tenant_id
      FROM campaign_ai_artifacts art
      WHERE art.id = campaign_ai_artifact_dependencies.campaign_ai_artifact_id
        AND campaign_ai_artifact_dependencies.tenant_id IS NULL
        AND art.tenant_id IS NOT NULL
    SQL

    # D16: users — regular users only (admins have nil project_id, tenant_id stays nil)
    results << execute_or_count(conn, 'users', <<~SQL.squish, dry_run: dry_run)
      UPDATE users
      SET tenant_id = c.tenant_id
      FROM clients c
      WHERE c.id = users.project_id
        AND users.tenant_id IS NULL
        AND users.project_id IS NOT NULL
        AND c.tte_id IS NOT NULL
    SQL

    # D17: ai_assistant_chats — fallback via session, then user
    results << execute_or_count(conn, 'ai_assistant_chats', <<~SQL.squish, dry_run: dry_run)
      UPDATE ai_assistant_chats
      SET tenant_id = COALESCE(s.tenant_id, u.tenant_id)
      FROM ai_assisted_user_sessions s,
           users u
      WHERE u.id = ai_assistant_chats.user_id
        AND s.id = ai_assistant_chats.ai_assisted_user_session_id
        AND ai_assistant_chats.tenant_id IS NULL
        AND COALESCE(s.tenant_id, u.tenant_id) IS NOT NULL
    SQL
    ai_assistant_chats_user_fallback_sql = <<~SQL.squish
      UPDATE ai_assistant_chats
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = ai_assistant_chats.user_id
        AND ai_assistant_chats.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'ai_assistant_chats',
      ai_assistant_chats_user_fallback_sql,
      dry_run: dry_run,
      label: 'fallback via user'
    )

    # D18: ai_assisted_user_sessions — fallback via resource, assistable, then user
    results << execute_or_count(conn, 'ai_assisted_user_sessions', <<~SQL.squish, dry_run: dry_run)
      UPDATE ai_assisted_user_sessions
      SET tenant_id = COALESCE(
        (
          SELECT ua.tenant_id
          FROM user_assessments ua
          WHERE ai_assisted_user_sessions.resource_type = 'UserAssessment'
            AND ua.id = ai_assisted_user_sessions.resource_id
          LIMIT 1
        ),
        (
          SELECT uip.tenant_id
          FROM user_idp_plans uip
          WHERE ai_assisted_user_sessions.assistable_type = 'UserIdpPlan'
            AND uip.id = ai_assisted_user_sessions.assistable_id
          LIMIT 1
        ),
        (
          SELECT uis.tenant_id
          FROM user_idp_skills uis
          WHERE ai_assisted_user_sessions.assistable_type = 'UserIdpSkill'
            AND uis.id = ai_assisted_user_sessions.assistable_id
          LIMIT 1
        ),
        (
          SELECT art.tenant_id
          FROM campaign_ai_artifacts art
          WHERE ai_assisted_user_sessions.assistable_type = 'AI::CampaignArtifact'
            AND art.id = ai_assisted_user_sessions.assistable_id
          LIMIT 1
        ),
        (
          SELECT uip.tenant_id
          FROM active_storage_attachments asa
          JOIN user_idp_plans uip ON uip.id = asa.record_id
          WHERE ai_assisted_user_sessions.assistable_type = 'ActiveStorage::Attachment'
            AND asa.id = ai_assisted_user_sessions.assistable_id
            AND asa.record_type = 'UserIdpPlan'
          LIMIT 1
        ),
        u.tenant_id
      )
      FROM users u
      WHERE u.id = ai_assisted_user_sessions.user_id
        AND ai_assisted_user_sessions.tenant_id IS NULL
        AND COALESCE(
          (
            SELECT ua.tenant_id
            FROM user_assessments ua
            WHERE ai_assisted_user_sessions.resource_type = 'UserAssessment'
              AND ua.id = ai_assisted_user_sessions.resource_id
            LIMIT 1
          ),
          (
            SELECT uip.tenant_id
            FROM user_idp_plans uip
            WHERE ai_assisted_user_sessions.assistable_type = 'UserIdpPlan'
              AND uip.id = ai_assisted_user_sessions.assistable_id
            LIMIT 1
          ),
          (
            SELECT uis.tenant_id
            FROM user_idp_skills uis
            WHERE ai_assisted_user_sessions.assistable_type = 'UserIdpSkill'
              AND uis.id = ai_assisted_user_sessions.assistable_id
            LIMIT 1
          ),
          (
            SELECT art.tenant_id
            FROM campaign_ai_artifacts art
            WHERE ai_assisted_user_sessions.assistable_type = 'AI::CampaignArtifact'
              AND art.id = ai_assisted_user_sessions.assistable_id
            LIMIT 1
          ),
          (
            SELECT uip.tenant_id
            FROM active_storage_attachments asa
            JOIN user_idp_plans uip ON uip.id = asa.record_id
            WHERE ai_assisted_user_sessions.assistable_type = 'ActiveStorage::Attachment'
              AND asa.id = ai_assisted_user_sessions.assistable_id
              AND asa.record_type = 'UserIdpPlan'
            LIMIT 1
          ),
          u.tenant_id
        ) IS NOT NULL
    SQL

    # D19: ai_translation_results — via translatable (currently only UserReport)
    results << execute_or_count(conn, 'ai_translation_results', <<~SQL.squish, dry_run: dry_run)
      UPDATE ai_translation_results
      SET tenant_id = ur.tenant_id
      FROM user_reports ur
      WHERE ur.id = ai_translation_results.translatable_id
        AND ai_translation_results.translatable_type = 'UserReport'
        AND ai_translation_results.tenant_id IS NULL
        AND ur.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # Group A-new — Tables with owner_id → Client
    # Uses clients.tenant_id directly — handles both root and sub-client owners.
    # -------------------------------------------------------------------------
    group_a_new_tables = %w[
      ai_assistants
      assessments
      campaign_templates
      data_reports
      development_actions
      dimensions
      libraries
      norms
      reports
    ]

    group_a_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = c.tenant_id
        FROM clients c
        WHERE c.id = #{table}.owner_id
          AND #{table}.tenant_id IS NULL
          AND #{table}.owner_id IS NOT NULL
          AND c.tenant_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # Group B-new — Tables with client_id → root Client (c.id directly)
    # -------------------------------------------------------------------------
    group_b_new_tables = %w[
      admin_roles
      client_auditlog_export_settings
      client_features
      client_privacy_settings
      communications
      license_usages
      licenses
      skill_aliases
    ]

    group_b_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = c.tenant_id
        FROM clients c
        WHERE c.id = #{table}.client_id
          AND #{table}.tenant_id IS NULL
          AND #{table}.client_id IS NOT NULL
          AND c.tenant_id IS NOT NULL
      SQL
    end

    # client_ai_assistants uses ai_assistant_id (no direct client_id) — handled in Group D-new (D13)

    # -------------------------------------------------------------------------
    # Group C-new — Tables with project_id → sub-client (c.tte_id only)
    # Records where project_id points to a root client (tte_id IS NULL) are left unset.
    # -------------------------------------------------------------------------
    group_c_new_tables = %w[
      proficiency_levels
      reflection_questions
      skillvue_assessments
      skills_job_roles
    ]

    group_c_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = c.tenant_id
        FROM clients c
        WHERE c.id = #{table}.project_id
          AND #{table}.tenant_id IS NULL
          AND #{table}.project_id IS NOT NULL
          AND c.tte_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # Group D-new — Indirect FKs (run in dependency order)
    # -------------------------------------------------------------------------

    # D1-new: via assessment_id → assessments.tenant_id (requires Group A-new assessments backfill above)
    group_d1_new_tables = %w[
      agiles
      assessment_consent_settings
      blocks
      question_recoding
      questions
    ]

    group_d1_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = a.tenant_id
        FROM assessments a
        WHERE a.id = #{table}.assessment_id
          AND #{table}.tenant_id IS NULL
          AND a.tenant_id IS NOT NULL
      SQL
    end

    # D1b-new: highlights — via user_id → users.tenant_id
    results << execute_or_count(conn, 'highlights', <<~SQL.squish, dry_run: dry_run)
      UPDATE highlights
         SET tenant_id = u.tenant_id
        FROM users u
       WHERE u.id = highlights.user_id
         AND highlights.tenant_id IS NULL
         AND u.tenant_id IS NOT NULL
    SQL

    # D1c-new: questions fallback via owner_id → clients.tenant_id
    # Standalone question banks not tied to an assessment resolve via owner instead.
    results << execute_or_count(conn, 'questions', <<~SQL.squish, dry_run: dry_run, label: 'via owner_id fallback')
      UPDATE questions
      SET tenant_id = c.tenant_id
      FROM clients c
      WHERE c.id = questions.owner_id
        AND questions.tenant_id IS NULL
        AND questions.owner_id IS NOT NULL
        AND c.tenant_id IS NOT NULL
    SQL

    # Standalone blocks not tied to an assessment resolve via owner instead.
    results << execute_or_count(conn, 'blocks', <<~SQL.squish, dry_run: dry_run, label: 'via owner_id fallback')
      UPDATE blocks
      SET tenant_id = c.tenant_id
      FROM clients c
      WHERE c.id = blocks.owner_id
        AND blocks.tenant_id IS NULL
        AND blocks.owner_id IS NOT NULL
        AND c.tenant_id IS NOT NULL
    SQL

    # D2-new: factors via dimension_id → dimensions.tenant_id (requires Group A-new dimensions backfill above)
    results << execute_or_count(conn, 'factors', <<~SQL.squish, dry_run: dry_run)
      UPDATE factors
      SET tenant_id = d.tenant_id
      FROM dimensions d
      WHERE d.id = factors.dimension_id
        AND factors.tenant_id IS NULL
        AND d.tenant_id IS NOT NULL
    SQL

    # D2b-new: factors_scoring fallback via factor_id → factors.tenant_id
    # Some factors_scoring rows belong to assessments with nil tenant (sub-client owner),
    # but their linked factor may still resolve via a tenant-scoped dimension.
    results << execute_or_count(conn, 'factors_scoring', <<~SQL.squish, dry_run: dry_run)
      UPDATE factors_scoring
      SET tenant_id = f.tenant_id
      FROM factors f
      WHERE f.id = factors_scoring.factor_id
        AND factors_scoring.tenant_id IS NULL
        AND f.tenant_id IS NOT NULL
    SQL

    # D3-new: factors_sub_factors via factor_id → factors.tenant_id (requires D2-new above)
    results << execute_or_count(conn, 'factors_sub_factors', <<~SQL.squish, dry_run: dry_run)
      UPDATE factors_sub_factors
      SET tenant_id = f.tenant_id
      FROM factors f
      WHERE f.id = factors_sub_factors.factor_id
        AND factors_sub_factors.tenant_id IS NULL
        AND f.tenant_id IS NOT NULL
    SQL

    # D4-new: factors_norms — pass 1 via norm, pass 2 via factor fallback
    factors_norms_norm_sql = <<~SQL.squish
      UPDATE factors_norms
      SET tenant_id = n.tenant_id
      FROM norms n
      WHERE n.id = factors_norms.norm_id
        AND factors_norms.tenant_id IS NULL
        AND n.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(conn, 'factors_norms', factors_norms_norm_sql, dry_run: dry_run, label: 'via norm_id')
    factors_norms_factor_fallback_sql = <<~SQL.squish
      UPDATE factors_norms
      SET tenant_id = f.tenant_id
      FROM factors f
      WHERE f.id = factors_norms.factor_id
        AND factors_norms.tenant_id IS NULL
        AND f.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'factors_norms',
      factors_norms_factor_fallback_sql,
      dry_run: dry_run,
      label: 'via factor_id fallback'
    )

    # D5-new: factors_aliases — pass 1 via report, pass 2 via factor fallback
    factors_aliases_report_sql = <<~SQL.squish
      UPDATE factors_aliases
      SET tenant_id = r.tenant_id
      FROM reports r
      WHERE r.id = factors_aliases.report_id
        AND factors_aliases.tenant_id IS NULL
        AND r.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'factors_aliases',
      factors_aliases_report_sql,
      dry_run: dry_run,
      label: 'via report_id'
    )
    factors_aliases_factor_sql = <<~SQL.squish
      UPDATE factors_aliases
      SET tenant_id = f.tenant_id
      FROM factors f
      WHERE f.id = factors_aliases.factor_id
        AND factors_aliases.tenant_id IS NULL
        AND f.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'factors_aliases',
      factors_aliases_factor_sql,
      dry_run: dry_run,
      label: 'via factor_id fallback'
    )

    # D6-new: via report_id → reports.tenant_id (requires Group A-new reports backfill above)
    group_d6_new_tables = %w[
      reports_campaign_ai_artifacts
      reports_campaign_factors
      reports_filters
      reports_pages
    ]

    group_d6_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = r.tenant_id
        FROM reports r
        WHERE r.id = #{table}.report_id
          AND #{table}.tenant_id IS NULL
          AND r.tenant_id IS NOT NULL
      SQL
    end

    # D7-new: reports_modules via page_id → reports_pages.tenant_id (requires D6-new above)
    results << execute_or_count(conn, 'reports_modules', <<~SQL.squish, dry_run: dry_run)
      UPDATE reports_modules
      SET tenant_id = rp.tenant_id
      FROM reports_pages rp
      WHERE rp.id = reports_modules.page_id
        AND reports_modules.tenant_id IS NULL
        AND rp.tenant_id IS NOT NULL
    SQL

    # D8-new: via idp_template_id → idp_templates.tenant_id (already backfilled in Group A above)
    group_d8_new_tables = %w[
      idp_template_development_actions
      idp_template_interview_questions
      idp_template_reflection_questions
      idp_template_skills
    ]

    group_d8_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = t.tenant_id
        FROM idp_templates t
        WHERE t.id = #{table}.idp_template_id
          AND #{table}.tenant_id IS NULL
          AND t.tenant_id IS NOT NULL
      SQL
    end

    # D9-new: via membership_id → memberships.tenant_id (already backfilled in Group C above)
    group_d9_new_tables = %w[membership_grants memberships_admin_roles]

    group_d9_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = m.tenant_id
        FROM memberships m
        WHERE m.id = #{table}.membership_id
          AND #{table}.tenant_id IS NULL
          AND m.tenant_id IS NOT NULL
      SQL
    end

    # D10-new: notifications — pass 1 via assessment, pass 2 via membership fallback
    notifications_assessment_sql = <<~SQL.squish
      UPDATE notifications
      SET tenant_id = a.tenant_id
      FROM assessments a
      WHERE a.id = notifications.assessment_id
        AND notifications.tenant_id IS NULL
        AND a.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'notifications',
      notifications_assessment_sql,
      dry_run: dry_run,
      label: 'via assessment_id'
    )
    notifications_membership_sql = <<~SQL.squish
      UPDATE notifications
      SET tenant_id = m.tenant_id
      FROM memberships m
      WHERE m.id = notifications.membership_id
        AND notifications.tenant_id IS NULL
        AND m.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'notifications',
      notifications_membership_sql,
      dry_run: dry_run,
      label: 'via membership_id fallback'
    )

    # D11-new: via communication_id → communications.tenant_id (requires Group B-new communications backfill above)
    group_d11_new_tables = %w[communications_copy_memberships communications_memberships]

    group_d11_new_tables.each do |table|
      results << execute_or_count(conn, table, <<~SQL.squish, dry_run: dry_run)
        UPDATE #{table}
        SET tenant_id = comm.tenant_id
        FROM communications comm
        WHERE comm.id = #{table}.communication_id
          AND #{table}.tenant_id IS NULL
          AND comm.tenant_id IS NOT NULL
      SQL
    end

    # D12-new: skills_development_actions — pass 1 via skill_id, pass 2 via development_action fallback
    skills_development_actions_skill_sql = <<~SQL.squish
      UPDATE skills_development_actions
      SET tenant_id = s.tenant_id
      FROM skills s
      WHERE s.id = skills_development_actions.skill_id
        AND skills_development_actions.tenant_id IS NULL
        AND s.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'skills_development_actions',
      skills_development_actions_skill_sql,
      dry_run: dry_run,
      label: 'via skill_id'
    )
    skills_development_actions_development_action_sql = <<~SQL.squish
      UPDATE skills_development_actions
      SET tenant_id = da.tenant_id
      FROM development_actions da
      WHERE da.id = skills_development_actions.development_action_id
        AND skills_development_actions.tenant_id IS NULL
        AND da.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'skills_development_actions',
      skills_development_actions_development_action_sql,
      dry_run: dry_run,
      label: 'via development_action fallback'
    )

    # D13-new skipped: ai_assistants.tenant_id is nil in production (owner_id is nil),
    # so ai_assistant_output_schema_keys and client_ai_assistants would remain NULL anyway.

    # D14-new: ai_assistant_requests via ai_assistant_chat_id → ai_assistant_chats.tenant_id
    # (ai_assistant_chats already backfilled in D17 above)
    results << execute_or_count(conn, 'ai_assistant_requests', <<~SQL.squish, dry_run: dry_run)
      UPDATE ai_assistant_requests
      SET tenant_id = ch.tenant_id
      FROM ai_assistant_chats ch
      WHERE ch.id = ai_assistant_requests.ai_assistant_chat_id
        AND ai_assistant_requests.tenant_id IS NULL
        AND ch.tenant_id IS NOT NULL
    SQL

    # D15-new: ai_assistant_tool_calls via ai_assistant_request_id (requires D14-new above)
    results << execute_or_count(conn, 'ai_assistant_tool_calls', <<~SQL.squish, dry_run: dry_run)
      UPDATE ai_assistant_tool_calls
      SET tenant_id = req.tenant_id
      FROM ai_assistant_requests req
      WHERE req.id = ai_assistant_tool_calls.ai_assistant_request_id
        AND ai_assistant_tool_calls.tenant_id IS NULL
        AND req.tenant_id IS NOT NULL
    SQL

    # D17-new: transcriptions via transcribable_id for MediaResponse type only
    # Other transcribable types are left with NULL tenant_id.
    results << execute_or_count(conn, 'transcriptions', <<~SQL.squish, dry_run: dry_run)
      UPDATE transcriptions
      SET tenant_id = mr.tenant_id
      FROM media_responses mr
      WHERE mr.id = transcriptions.transcribable_id
        AND transcriptions.transcribable_type = 'MediaResponse'
        AND transcriptions.tenant_id IS NULL
        AND mr.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D18-new: Hogan chain (in dependency order)
    # -------------------------------------------------------------------------

    # Step 1: hogan_credentials — pass 1 via user, pass 2 via membership fallback
    hogan_credentials_user_sql = <<~SQL.squish
      UPDATE hogan_credentials
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = hogan_credentials.user_id
        AND hogan_credentials.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'hogan_credentials',
      hogan_credentials_user_sql,
      dry_run: dry_run,
      label: 'via user'
    )
    hogan_credentials_membership_sql = <<~SQL.squish
      UPDATE hogan_credentials
      SET tenant_id = m.tenant_id
      FROM memberships m
      WHERE m.id = hogan_credentials.membership_id
        AND hogan_credentials.tenant_id IS NULL
        AND m.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'hogan_credentials',
      hogan_credentials_membership_sql,
      dry_run: dry_run,
      label: 'via membership fallback'
    )

    # Step 2: hogan_report_settings via report_id → reports.tenant_id
    results << execute_or_count(conn, 'hogan_report_settings', <<~SQL.squish, dry_run: dry_run)
      UPDATE hogan_report_settings
      SET tenant_id = r.tenant_id
      FROM reports r
      WHERE r.id = hogan_report_settings.report_id
        AND hogan_report_settings.tenant_id IS NULL
        AND r.tenant_id IS NOT NULL
    SQL

    # Step 3: hogan_logs via participant_id → hogan_credentials (requires Step 1)
    results << execute_or_count(conn, 'hogan_logs', <<~SQL.squish, dry_run: dry_run)
      UPDATE hogan_logs
      SET tenant_id = hc.tenant_id
      FROM hogan_credentials hc
      WHERE hc.participant_id = hogan_logs.participant_id
        AND hogan_logs.tenant_id IS NULL
        AND hc.tenant_id IS NOT NULL
    SQL

    # Step 4: resource_hogan_credentials — via hogan_credential
    results << execute_or_count(conn, 'resource_hogan_credentials', <<~SQL.squish, dry_run: dry_run)
      UPDATE resource_hogan_credentials
      SET tenant_id = hc.tenant_id
      FROM hogan_credentials hc
      WHERE hc.id = resource_hogan_credentials.hogan_credential_id
        AND resource_hogan_credentials.tenant_id IS NULL
        AND hc.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D19-new: communication_email_resources
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'communication_email_resources', <<~SQL.squish, dry_run: dry_run)
      UPDATE communication_email_resources
      SET tenant_id = ce.tenant_id
      FROM communication_emails ce
      WHERE ce.id = communication_email_resources.communication_email_id
        AND communication_email_resources.tenant_id IS NULL
        AND ce.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D20-new: profile chain (in dependency order)
    # -------------------------------------------------------------------------

    # Step 1: profile_fields via profile_setting_id → profile_settings.tenant_id
    results << execute_or_count(conn, 'profile_fields', <<~SQL.squish, dry_run: dry_run)
      UPDATE profile_fields
      SET tenant_id = ps.tenant_id
      FROM profile_settings ps
      WHERE ps.id = profile_fields.profile_setting_id
        AND profile_fields.tenant_id IS NULL
        AND ps.tenant_id IS NOT NULL
    SQL

    # Step 2: profile_field_values via profile_field_id (requires Step 1)
    results << execute_or_count(conn, 'profile_field_values', <<~SQL.squish, dry_run: dry_run)
      UPDATE profile_field_values
      SET tenant_id = pf.tenant_id
      FROM profile_fields pf
      WHERE pf.id = profile_field_values.profile_field_id
        AND profile_field_values.tenant_id IS NULL
        AND pf.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D21-new: datasheet_column_preferences (polymorphic: Campaign or Client)
    # -------------------------------------------------------------------------
    datasheet_column_preferences_campaign_sql = <<~SQL.squish
      UPDATE datasheet_column_preferences
      SET tenant_id = c.tenant_id
      FROM campaigns c
      WHERE c.id = datasheet_column_preferences.resource_id
        AND datasheet_column_preferences.resource_type = 'Campaign'
        AND datasheet_column_preferences.tenant_id IS NULL
        AND c.tenant_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'datasheet_column_preferences',
      datasheet_column_preferences_campaign_sql,
      dry_run: dry_run,
      label: 'via Campaign'
    )
    datasheet_column_preferences_client_root_sql = <<~SQL.squish
      UPDATE datasheet_column_preferences
      SET tenant_id = c.id
      FROM clients c
      WHERE c.id = datasheet_column_preferences.resource_id
        AND datasheet_column_preferences.resource_type = 'Client'
        AND datasheet_column_preferences.tenant_id IS NULL
        AND c.tte_id IS NULL
    SQL
    results << execute_or_count(
      conn,
      'datasheet_column_preferences',
      datasheet_column_preferences_client_root_sql,
      dry_run: dry_run,
      label: 'via Client (root)'
    )
    datasheet_column_preferences_client_sub_sql = <<~SQL.squish
      UPDATE datasheet_column_preferences
      SET tenant_id = c.tte_id
      FROM clients c
      WHERE c.id = datasheet_column_preferences.resource_id
        AND datasheet_column_preferences.resource_type = 'Client'
        AND datasheet_column_preferences.tenant_id IS NULL
        AND c.tte_id IS NOT NULL
    SQL
    results << execute_or_count(
      conn,
      'datasheet_column_preferences',
      datasheet_column_preferences_client_sub_sql,
      dry_run: dry_run,
      label: 'via Client (sub)'
    )

    # -------------------------------------------------------------------------
    # D22-new: active_storage_attachments — single-pass CASE UPDATE across all
    # known tenant-scoped record_types. Unrecognised types remain NULL.
    # -------------------------------------------------------------------------
    active_storage_type_table_map = {
      'AdminJobRecord' => 'admin_jobs',
      'AI::AssistantRequest' => 'ai_assistant_requests',
      'Assessment' => 'assessments',
      'BulkReport' => 'bulk_reports',
      'CampaignReport' => 'campaign_reports',
      'Dashboard' => 'dashboards',
      'DataReportJob' => 'data_report_jobs',
      'DesignSetting' => 'design_settings',
      'DevelopmentAction' => 'development_actions',
      'Factor' => 'factors',
      'IdpReportPdf' => 'idp_report_pdfs',
      'IdpTemplate' => 'idp_templates',
      'Library' => 'libraries',
      'MediaResponse' => 'media_responses',
      'Report' => 'reports',
      'UserAssessmentVerificationImage' => 'user_assessment_verification_images',
      'UserAssessmentVerificationMedium' => 'user_assessment_verification_media',
      'UserIdpPlan' => 'user_idp_plans',
      'UserReportPdf' => 'user_report_pdfs',
      'UserReport' => 'user_reports'
    }

    valid_types = active_storage_type_table_map.select { |_, table| existing_tables.include?(table) }

    if valid_types.any?
      case_branches = valid_types.map do |type, table|
        "WHEN '#{type}' THEN (SELECT t.tenant_id FROM #{table} t WHERE t.id = active_storage_attachments.record_id)"
      end.join(' ')
      type_list = valid_types.keys.map { |t| "'#{t}'" }.join(', ')

      results << execute_or_count(conn, 'active_storage_attachments', <<~SQL.squish, dry_run: dry_run)
        UPDATE active_storage_attachments
        SET tenant_id = CASE record_type #{case_branches} END
        WHERE tenant_id IS NULL
          AND record_type IN (#{type_list})
          AND CASE record_type #{case_branches} END IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # D23-new: innovation_styles via dimension_id → dimensions.tenant_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'innovation_styles', <<~SQL.squish, dry_run: dry_run)
      UPDATE innovation_styles
      SET tenant_id = d.tenant_id
      FROM dimensions d
      WHERE d.id = innovation_styles.dimension_id
        AND innovation_styles.tenant_id IS NULL
        AND d.tenant_id IS NOT NULL
    SQL

    # D24-new: innovation_styles_factors via innovation_style_id → innovation_styles.tenant_id
    results << execute_or_count(conn, 'innovation_styles_factors', <<~SQL.squish, dry_run: dry_run)
      UPDATE innovation_styles_factors
      SET tenant_id = s.tenant_id
      FROM innovation_styles s
      WHERE s.id = innovation_styles_factors.innovation_style_id
        AND innovation_styles_factors.tenant_id IS NULL
        AND s.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D25-new: occupations via dimension_id → dimensions.tenant_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'occupations', <<~SQL.squish, dry_run: dry_run)
      UPDATE occupations
      SET tenant_id = d.tenant_id
      FROM dimensions d
      WHERE d.id = occupations.dimension_id
        AND occupations.tenant_id IS NULL
        AND d.tenant_id IS NOT NULL
    SQL

    # D26-new: occupations_factors via occupation_id → occupations.tenant_id
    results << execute_or_count(conn, 'occupations_factors', <<~SQL.squish, dry_run: dry_run)
      UPDATE occupations_factors
      SET tenant_id = o.tenant_id
      FROM occupations o
      WHERE o.id = occupations_factors.occupation_id
        AND occupations_factors.tenant_id IS NULL
        AND o.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D28-new: saville_report_settings via report_id → reports.tenant_id
    results << execute_or_count(conn, 'saville_report_settings', <<~SQL.squish, dry_run: dry_run)
      UPDATE saville_report_settings
      SET tenant_id = r.tenant_id
      FROM reports r
      WHERE r.id = saville_report_settings.report_id
        AND saville_report_settings.tenant_id IS NULL
        AND r.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D29-new: meeting_rooms — polymorphic meetable, handled dynamically per type
    # Discovers distinct meetable_types in the DB, derives the table name via
    # Rails naming convention, and runs one UPDATE per type.
    # -------------------------------------------------------------------------
    meeting_room_types = conn.select_values(
      'SELECT DISTINCT meetable_type FROM meeting_rooms WHERE meetable_type IS NOT NULL'
    )
    meeting_room_types.each do |type|
      table = type.underscore.pluralize
      next unless conn.table_exists?(table) && conn.column_exists?(table, 'tenant_id')

      results << execute_or_count(conn, 'meeting_rooms', <<~SQL.squish, dry_run: dry_run, label: "via #{type}")
        UPDATE meeting_rooms
        SET tenant_id = t.tenant_id
        FROM #{table} t
        WHERE t.id = meeting_rooms.meetable_id
          AND meeting_rooms.meetable_type = '#{type}'
          AND meeting_rooms.tenant_id IS NULL
          AND t.tenant_id IS NOT NULL
      SQL
    end

    # D30-new: meeting_recordings via meeting_room_id → meeting_rooms.tenant_id
    results << execute_or_count(conn, 'meeting_recordings', <<~SQL.squish, dry_run: dry_run)
      UPDATE meeting_recordings
      SET tenant_id = mr.tenant_id
      FROM meeting_rooms mr
      WHERE mr.id = meeting_recordings.meeting_room_id
        AND meeting_recordings.tenant_id IS NULL
        AND mr.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D31-new: webhook_event_logs via subscription_id → webhook_subscriptions.tenant_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'webhook_event_logs', <<~SQL.squish, dry_run: dry_run)
      UPDATE webhook_event_logs
      SET tenant_id = ws.tenant_id
      FROM webhook_subscriptions ws
      WHERE ws.id = webhook_event_logs.subscription_id
        AND webhook_event_logs.tenant_id IS NULL
        AND ws.tenant_id IS NOT NULL
    SQL

    # D32-new: webhook_subscription_topics via subscription_id → webhook_subscriptions.tenant_id
    results << execute_or_count(conn, 'webhook_subscription_topics', <<~SQL.squish, dry_run: dry_run)
      UPDATE webhook_subscription_topics
      SET tenant_id = ws.tenant_id
      FROM webhook_subscriptions ws
      WHERE ws.id = webhook_subscription_topics.subscription_id
        AND webhook_subscription_topics.tenant_id IS NULL
        AND ws.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D33-new: user_profiles via user_id → users.tenant_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'user_profiles', <<~SQL.squish, dry_run: dry_run)
      UPDATE user_profiles
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = user_profiles.user_id
        AND user_profiles.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D34-new: privacy_consents via user_id → users.tenant_id
    # Matches model's tenant_source :user — the user's project determines the tenant.
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'privacy_consents', <<~SQL.squish, dry_run: dry_run)
      UPDATE privacy_consents
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = privacy_consents.user_id
        AND privacy_consents.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D35-new: user_bookings via booked_by_resource (polymorphic, dynamic per type)
    # Falls back to user_id if resource type cannot be resolved.
    # -------------------------------------------------------------------------
    user_booking_types = conn.select_values(
      'SELECT DISTINCT booked_by_resource_type FROM user_bookings WHERE booked_by_resource_type IS NOT NULL'
    )
    user_booking_types.each do |type|
      table = type.underscore.pluralize
      next unless conn.table_exists?(table) && conn.column_exists?(table, 'tenant_id')

      results << execute_or_count(conn, 'user_bookings', <<~SQL.squish, dry_run: dry_run, label: "via #{type}")
        UPDATE user_bookings
        SET tenant_id = t.tenant_id
        FROM #{table} t
        WHERE t.id = user_bookings.booked_by_resource_id
          AND user_bookings.booked_by_resource_type = '#{type}'
          AND user_bookings.tenant_id IS NULL
          AND t.tenant_id IS NOT NULL
      SQL
    end

    results << execute_or_count(conn, 'user_bookings', <<~SQL.squish, dry_run: dry_run, label: 'via user_id fallback')
      UPDATE user_bookings
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = user_bookings.user_id
        AND user_bookings.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D37-new: system_check_sessions via user_id → users.tenant_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'system_check_sessions', <<~SQL.squish, dry_run: dry_run)
      UPDATE system_check_sessions
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = system_check_sessions.user_id
        AND system_check_sessions.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D38-new: system_check_records via system_check_session_id → system_check_sessions.tenant_id
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'system_check_records', <<~SQL.squish, dry_run: dry_run)
      UPDATE system_check_records
      SET tenant_id = s.tenant_id
      FROM system_check_sessions s
      WHERE s.id = system_check_records.system_check_session_id
        AND system_check_records.tenant_id IS NULL
        AND s.tenant_id IS NOT NULL
    SQL

    # -------------------------------------------------------------------------
    # D36-new: vector_embeddings via resource (polymorphic)
    # Only handles known tenant-scoped resource types. Others remain NULL (hybrid).
    # -------------------------------------------------------------------------
    vector_embedding_type_table_map = {
      'Skill' => 'skills',
      'Factor' => 'factors',
      'DevelopmentAction' => 'development_actions',
      'JobRole' => 'job_roles'
    }

    valid_vector_types = vector_embedding_type_table_map.select { |_, table| existing_tables.include?(table) }

    if valid_vector_types.any?
      case_branches = valid_vector_types.map do |type, table|
        "WHEN '#{type}' THEN (SELECT t.tenant_id FROM #{table} t WHERE t.id = vector_embeddings.resource_id)"
      end.join(' ')
      type_list = valid_vector_types.keys.map { |t| "'#{t}'" }.join(', ')

      results << execute_or_count(conn, 'vector_embeddings', <<~SQL.squish, dry_run: dry_run)
        UPDATE vector_embeddings
        SET tenant_id = CASE resource_type #{case_branches} END
        WHERE tenant_id IS NULL
          AND resource_type IN (#{type_list})
          AND CASE resource_type #{case_branches} END IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # D39: taggings — via taggable_type/taggable_id → taggable record's tenant_id
    # -------------------------------------------------------------------------
    taggable_types = conn.select_values(
      'SELECT DISTINCT taggable_type FROM taggings WHERE taggable_type IS NOT NULL AND tenant_id IS NULL'
    )
    taggable_types.each do |type|
      table = resolve_table_for_type(type)
      next unless table && conn.table_exists?(table) && conn.column_exists?(table, 'tenant_id')

      results << execute_or_count(conn, 'taggings', <<~SQL.squish, dry_run: dry_run, label: "via #{type}")
        UPDATE taggings
           SET tenant_id = t.tenant_id
          FROM #{conn.quote_table_name(table)} t
         WHERE t.id = taggings.taggable_id
           AND taggings.taggable_type = #{conn.quote(type)}
           AND taggings.tenant_id IS NULL
           AND t.tenant_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # D40: versions — via item_type/item_id → item record's tenant_id (paper_trail)
    # -------------------------------------------------------------------------
    item_types = conn.select_values(
      'SELECT DISTINCT item_type FROM versions WHERE item_type IS NOT NULL AND tenant_id IS NULL'
    )
    item_types.each do |type|
      table = resolve_table_for_type(type)
      next unless table && conn.table_exists?(table) && conn.column_exists?(table, 'tenant_id')

      results << execute_or_count(conn, 'versions', <<~SQL.squish, dry_run: dry_run, label: "via #{type}")
        UPDATE versions
           SET tenant_id = t.tenant_id
          FROM #{conn.quote_table_name(table)} t
         WHERE t.id = versions.item_id
           AND versions.item_type = #{conn.quote(type)}
           AND versions.tenant_id IS NULL
           AND t.tenant_id IS NOT NULL
      SQL
    end

    # -------------------------------------------------------------------------
    # D41: version_associations — via version_id → versions.tenant_id (requires D40 above)
    # -------------------------------------------------------------------------
    results << execute_or_count(conn, 'version_associations', <<~SQL.squish, dry_run: dry_run)
      UPDATE version_associations
         SET tenant_id = v.tenant_id
        FROM versions v
       WHERE v.id = version_associations.version_id
         AND version_associations.tenant_id IS NULL
         AND v.tenant_id IS NOT NULL
    SQL

    # Group E — Mobility translation tables
    backfill_translation_tables(conn, results, dry_run)

    print_backfill_results(results, mode)
    errors.each { |msg| puts "  #{red('WARN')} #{msg}" } if errors.any?
  end
  # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

  # Maps each table to SQL identifying orphaned rows (parent deleted OR FK is NULL).
  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Layout/LineLength
  def orphan_sql_for(table)
    # "FK is NULL" means no parent to derive tenant from — also an orphan
    project_orphan =
      "#{table}.project_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = #{table}.project_id)"
    campaign_orphan =
      "#{table}.campaign_id IS NULL OR NOT EXISTS (SELECT 1 FROM campaigns WHERE id = #{table}.campaign_id)"

    mapping = {
      # Group A — project_id
      'campaigns' => project_orphan, 'design_settings' => project_orphan,
      'idp_settings' => project_orphan, 'idp_templates' => project_orphan,
      'integrations' => project_orphan, 'interview_questions' => project_orphan,
      'job_roles' => project_orphan, 'mettl_assessments' => project_orphan,
      'mettl_schedule_records' => project_orphan, 'power_bi_settings' => project_orphan,
      'privacy_settings' => project_orphan, 'profile_settings' => project_orphan,
      'project_assessments' => project_orphan, 'project_features' => project_orphan,
      'project_licenses' => project_orphan, 'registration_settings' => project_orphan,
      'saml_service_providers' => project_orphan, 'saml_settings' => project_orphan,
      'security_settings' => project_orphan,
      'webhook_subscriptions' => project_orphan,
      # Group B — campaign_id
      'ai_scoring_approval_settings' => campaign_orphan,
      'assessors' => campaign_orphan, 'bulk_reports' => campaign_orphan,
      'campaign_ai_artifacts' => campaign_orphan, 'campaign_assessment_groups' => campaign_orphan,
      'campaign_assessments' => campaign_orphan, 'campaign_assessor_assessment_factor_weights' => campaign_orphan,
      'campaign_assessor_assessments' => campaign_orphan, 'campaign_factor_groups' => campaign_orphan,
      'campaign_factor_values' => campaign_orphan, 'campaign_factors' => campaign_orphan,
      'campaign_idps' => campaign_orphan, 'campaign_options' => campaign_orphan,
      'campaign_reports' => campaign_orphan, 'campaign_users' => campaign_orphan,
      'dashboards' => campaign_orphan, 'factor_benchmark_scores' => campaign_orphan,
      'registration_codes' => campaign_orphan, 'report_approval_settings' => campaign_orphan,
      'sms_invites' => campaign_orphan, 'sms_records' => campaign_orphan,
      'threesixty_campaigns' => campaign_orphan, 'threesixty_evaluators' => campaign_orphan,
      'threesixty_subjects' => campaign_orphan, 'user_assessments' => campaign_orphan,
      'user_idp_plans' => campaign_orphan, 'user_reports' => campaign_orphan,
      'workshop_invites' => campaign_orphan, 'workshop_subjects' => campaign_orphan,
      'workshops' => campaign_orphan
    }

    # Group A2 — smtp_settings
    # project_id references clients directly (project or root client); both are valid.
    # Only NULL/missing project client is orphaned.
    mapping['smtp_settings'] =
      'smtp_settings.project_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM clients WHERE id = smtp_settings.project_id)'

    # Group B2 — threesixty_campaign_id
    %w[threesixty_email_histories threesixty_email_schedules threesixty_email_templates
       threesixty_instruction_templates threesixty_nomination_requirements
       threesixty_options threesixty_reminder_histories].each do |t|
      mapping[t] =
        "#{t}.threesixty_campaign_id IS NULL OR " \
        "NOT EXISTS (SELECT 1 FROM threesixty_campaigns WHERE id = #{t}.threesixty_campaign_id)"
    end

    # Group C
    mapping['memberships'] =
      "#{table}.client_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = #{table}.client_id)"
    mapping['data_report_jobs'] =
      "#{table}.data_report_id IS NULL OR NOT EXISTS (SELECT 1 FROM data_reports WHERE id = #{table}.data_report_id)"

    # Group D1 — user_assessment_id
    %w[iiht_user_assessments mettl_user_assessments mhs_user_assessments pearson_user_assessments
       saville_user_assessments simulation_user_assessments skillvue_user_assessments
       yoodli_user_assessments user_assessment_factor_scores
       user_assessment_verification_images user_assessment_verification_media].each do |t|
      mapping[t] =
        "#{t}.user_assessment_id IS NULL OR " \
        "NOT EXISTS (SELECT 1 FROM user_assessments WHERE id = #{t}.user_assessment_id)"
    end

    # Group D2 — campaign_user_id
    # communication_emails falls back via communication_id, so only orphaned if both are unresolvable
    mapping['communication_emails'] =
      '(communication_emails.campaign_user_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM campaign_users WHERE id = communication_emails.campaign_user_id)) AND ' \
      '(communication_emails.communication_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM communications WHERE id = communication_emails.communication_id))'
    mapping['proctoring_sessions'] =
      'proctoring_sessions.campaign_user_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM campaign_users WHERE id = proctoring_sessions.campaign_user_id)'

    # Group D3 — workshop_id
    %w[workshop_assessors workshop_managers workshop_resources].each do |t|
      mapping[t] = "#{t}.workshop_id IS NULL OR NOT EXISTS (SELECT 1 FROM workshops WHERE id = #{t}.workshop_id)"
    end

    # Group D4 — communication_id
    %w[communication_cc_users communications_assessments communications_users].each do |t|
      mapping[t] =
        "#{t}.communication_id IS NULL OR NOT EXISTS (SELECT 1 FROM communications WHERE id = #{t}.communication_id)"
    end

    # Group D5 — user_idp_plan_id
    %w[idp_report_pdfs user_idp_comments user_idp_development_actions user_idp_skills
       user_reflection_question_answers].each do |t|
      mapping[t] =
        "#{t}.user_idp_plan_id IS NULL OR NOT EXISTS (SELECT 1 FROM user_idp_plans WHERE id = #{t}.user_idp_plan_id)"
    end

    # Group D6/D12 — user_report_id
    %w[user_report_pdfs text_module_overrides user_report_comments user_report_events].each do |t|
      mapping[t] =
        "#{t}.user_report_id IS NULL OR NOT EXISTS (SELECT 1 FROM user_reports WHERE id = #{t}.user_report_id)"
    end

    # Group D7/D14 — users_result_id
    %w[media_responses ai_factor_scores].each do |t|
      mapping[t] = "#{t}.users_result_id IS NULL OR " \
                   "NOT EXISTS (SELECT 1 FROM users_results WHERE id = #{t}.users_result_id) OR " \
                   "NOT EXISTS (SELECT 1 FROM user_assessments ua WHERE ua.users_result_id = #{t}.users_result_id)"
    end

    # Group D8 — campaign_idp_id
    mapping['campaign_idp_dependencies'] =
      "#{table}.campaign_idp_id IS NULL OR NOT EXISTS (SELECT 1 FROM campaign_idps WHERE id = #{table}.campaign_idp_id)"

    # Group D10 — sms_record_id
    mapping['sms_histories'] =
      "#{table}.sms_record_id IS NULL OR NOT EXISTS (SELECT 1 FROM sms_records WHERE id = #{table}.sms_record_id)"

    # Group D11/D14 — workshop_invite_id (also catches transitive: invite exists but its campaign_id is NULL)
    %w[workshop_invite_logs workshop_invited_subjects].each do |t|
      mapping[t] =
        "#{t}.workshop_invite_id IS NULL OR " \
        "NOT EXISTS (SELECT 1 FROM workshop_invites WHERE id = #{t}.workshop_invite_id) OR " \
        "EXISTS (SELECT 1 FROM workshop_invites wi WHERE wi.id = #{t}.workshop_invite_id AND wi.campaign_id IS NULL)"
    end

    # Group D13 — users_results (reverse join)
    mapping['users_results'] = "NOT EXISTS (SELECT 1 FROM user_assessments ua WHERE ua.users_result_id = #{table}.id)"

    # Group D16 — campaign_ai_artifact_id
    mapping['campaign_ai_artifact_dependencies'] =
      "#{table}.campaign_ai_artifact_id IS NULL OR " \
      "NOT EXISTS (SELECT 1 FROM campaign_ai_artifacts WHERE id = #{table}.campaign_ai_artifact_id)"

    # Hybrid — AI sessions/chats
    mapping['ai_assistant_chats'] = <<~SQL.squish
      (ai_assistant_chats.ai_assisted_user_session_id IS NULL OR
       NOT EXISTS (
         SELECT 1
         FROM ai_assisted_user_sessions s
         WHERE s.id = ai_assistant_chats.ai_assisted_user_session_id
       ))
      AND
      (ai_assistant_chats.user_id IS NULL OR
       NOT EXISTS (
         SELECT 1
         FROM users u
         WHERE u.id = ai_assistant_chats.user_id
       ))
    SQL

    mapping['ai_assisted_user_sessions'] = <<~SQL.squish
      (ai_assisted_user_sessions.user_id IS NULL OR
       NOT EXISTS (
         SELECT 1
         FROM users u
         WHERE u.id = ai_assisted_user_sessions.user_id
       ))
      AND
      (ai_assisted_user_sessions.resource_type != 'UserAssessment' OR
       ai_assisted_user_sessions.resource_id IS NULL OR
       NOT EXISTS (
         SELECT 1
         FROM user_assessments ua
         WHERE ua.id = ai_assisted_user_sessions.resource_id
       ))
      AND
      (
        ai_assisted_user_sessions.assistable_type NOT IN
          ('UserIdpPlan', 'UserIdpSkill', 'AI::CampaignArtifact', 'ActiveStorage::Attachment') OR
        (
          ai_assisted_user_sessions.assistable_type = 'UserIdpPlan' AND
          NOT EXISTS (
            SELECT 1
            FROM user_idp_plans uip
            WHERE uip.id = ai_assisted_user_sessions.assistable_id
          )
        ) OR
        (
          ai_assisted_user_sessions.assistable_type = 'UserIdpSkill' AND
          NOT EXISTS (
            SELECT 1
            FROM user_idp_skills uis
            WHERE uis.id = ai_assisted_user_sessions.assistable_id
          )
        ) OR
        (
          ai_assisted_user_sessions.assistable_type = 'AI::CampaignArtifact' AND
          NOT EXISTS (
            SELECT 1
            FROM campaign_ai_artifacts art
            WHERE art.id = ai_assisted_user_sessions.assistable_id
          )
        ) OR
        (
          ai_assisted_user_sessions.assistable_type = 'ActiveStorage::Attachment' AND
          NOT EXISTS (
            SELECT 1
            FROM active_storage_attachments asa
            WHERE asa.id = ai_assisted_user_sessions.assistable_id
              AND asa.record_type = 'UserIdpPlan'
          )
        )
      )
    SQL

    # Sheets — dual fallback (project_id first, then campaign_id); orphaned only when both are unresolvable
    mapping['sheets'] =
      '(sheets.project_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = sheets.project_id)) AND ' \
      '(sheets.campaign_id IS NULL OR NOT EXISTS (SELECT 1 FROM campaigns WHERE id = sheets.campaign_id))'

    # Sheet sub-tables — orphaned if parent sheet is missing
    mapping['sheet_columns'] =
      'sheet_columns.sheet_id IS NULL OR NOT EXISTS (SELECT 1 FROM sheets WHERE id = sheet_columns.sheet_id)'
    mapping['sheet_rows'] =
      'sheet_rows.sheet_id IS NULL OR NOT EXISTS (SELECT 1 FROM sheets WHERE id = sheet_rows.sheet_id)'
    mapping['sheet_row_data'] =
      'sheet_row_data.sheet_row_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM sheet_rows WHERE id = sheet_row_data.sheet_row_id)'

    # -------------------------------------------------------------------------
    # Phase 2 orphan mappings
    # -------------------------------------------------------------------------

    owner_orphan_tables = %w[
      ai_assistants assessments blocks campaign_templates data_reports development_actions
      dimensions libraries norms questions reports
    ]
    owner_orphan_tables.each do |t|
      mapping[t] = "#{t}.owner_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = #{t}.owner_id)"
    end

    client_id_orphan_tables = %w[
      admin_roles client_auditlog_export_settings client_features
      client_privacy_settings communications
      license_usages licenses skill_aliases
    ]
    client_id_orphan_tables.each do |t|
      mapping[t] = "#{t}.client_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = #{t}.client_id)"
    end

    project_id_orphan_tables = %w[proficiency_levels reflection_questions skillvue_assessments skills_job_roles]
    project_id_orphan_tables.each do |t|
      mapping[t] = "#{t}.project_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = #{t}.project_id)"
    end

    assessment_orphan_tables = %w[
      agiles assessment_assistants assessment_consent_settings
      question_recoding questions factors_scoring
    ]
    assessment_orphan_tables.each do |t|
      mapping[t] = "#{t}.assessment_id IS NULL OR NOT EXISTS (SELECT 1 FROM assessments WHERE id = #{t}.assessment_id)"
    end

    mapping['highlights'] =
      'highlights.user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = highlights.user_id)'

    mapping['dimensions'] =
      'dimensions.owner_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients WHERE id = dimensions.owner_id)'

    mapping['factors'] =
      'factors.dimension_id IS NULL OR NOT EXISTS (SELECT 1 FROM dimensions WHERE id = factors.dimension_id)'
    mapping['factors_sub_factors'] =
      'factors_sub_factors.factor_id IS NULL OR NOT EXISTS (SELECT 1 FROM factors WHERE id = factors_sub_factors.factor_id)'
    mapping['factors_norms'] =
      '(factors_norms.norm_id IS NULL OR NOT EXISTS (SELECT 1 FROM norms WHERE id = factors_norms.norm_id)) AND ' \
      '(factors_norms.factor_id IS NULL OR NOT EXISTS (SELECT 1 FROM factors WHERE id = factors_norms.factor_id))'
    mapping['factors_aliases'] =
      '(factors_aliases.report_id IS NULL OR NOT EXISTS (SELECT 1 FROM reports WHERE id = factors_aliases.report_id)) AND ' \
      '(factors_aliases.factor_id IS NULL OR NOT EXISTS (SELECT 1 FROM factors WHERE id = factors_aliases.factor_id))'

    report_orphan_tables = %w[assessments_reports reports_campaign_ai_artifacts reports_campaign_factors
                              reports_filters reports_pages]
    report_orphan_tables.each do |t|
      mapping[t] = "#{t}.report_id IS NULL OR NOT EXISTS (SELECT 1 FROM reports WHERE id = #{t}.report_id)"
    end

    mapping['reports_modules'] =
      'reports_modules.page_id IS NULL OR NOT EXISTS (SELECT 1 FROM reports_pages WHERE id = reports_modules.page_id)'

    idp_template_orphan_tables = %w[
      idp_template_development_actions idp_template_interview_questions
      idp_template_reflection_questions idp_template_skills
    ]
    idp_template_orphan_tables.each do |t|
      mapping[t] =
        "#{t}.idp_template_id IS NULL OR NOT EXISTS (SELECT 1 FROM idp_templates WHERE id = #{t}.idp_template_id)"
    end

    membership_orphan_tables = %w[membership_grants memberships_admin_roles]
    membership_orphan_tables.each do |t|
      mapping[t] = "#{t}.membership_id IS NULL OR NOT EXISTS (SELECT 1 FROM memberships WHERE id = #{t}.membership_id)"
    end

    mapping['notifications'] =
      '(notifications.assessment_id IS NULL OR NOT EXISTS (SELECT 1 FROM assessments WHERE id = notifications.assessment_id)) AND ' \
      '(notifications.membership_id IS NULL OR NOT EXISTS (SELECT 1 FROM memberships WHERE id = notifications.membership_id))'

    comm_orphan_tables = %w[communications_copy_memberships communications_memberships]
    comm_orphan_tables.each do |t|
      mapping[t] =
        "#{t}.communication_id IS NULL OR NOT EXISTS (SELECT 1 FROM communications WHERE id = #{t}.communication_id)"
    end

    mapping['skills_development_actions'] =
      'skills_development_actions.skill_id IS NULL OR NOT EXISTS (SELECT 1 FROM skills WHERE id = skills_development_actions.skill_id)'
    mapping['ai_assistant_requests'] =
      'ai_assistant_requests.ai_assistant_chat_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM ai_assistant_chats WHERE id = ai_assistant_requests.ai_assistant_chat_id)'
    mapping['ai_assistant_tool_calls'] =
      'ai_assistant_tool_calls.ai_assistant_request_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM ai_assistant_requests WHERE id = ai_assistant_tool_calls.ai_assistant_request_id)'
    mapping['admin_jobs'] =
      'admin_jobs.owner_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = admin_jobs.owner_id)'
    mapping['transcriptions'] =
      "(transcriptions.transcribable_type = 'MediaResponse' AND " \
      '(transcriptions.transcribable_id IS NULL OR NOT EXISTS (SELECT 1 FROM media_responses WHERE id = transcriptions.transcribable_id)))'
    mapping['hogan_credentials'] =
      '(hogan_credentials.user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = hogan_credentials.user_id)) AND ' \
      '(hogan_credentials.membership_id IS NULL OR NOT EXISTS (SELECT 1 FROM memberships WHERE id = hogan_credentials.membership_id))'
    mapping['hogan_report_settings'] =
      'hogan_report_settings.report_id IS NULL OR NOT EXISTS (SELECT 1 FROM reports WHERE id = hogan_report_settings.report_id)'
    mapping['hogan_logs'] =
      'hogan_logs.participant_id IS NULL OR NOT EXISTS (SELECT 1 FROM hogan_credentials WHERE participant_id = hogan_logs.participant_id)'
    mapping['resource_hogan_credentials'] = <<~SQL.squish
      (resource_hogan_credentials.hogan_credential_id IS NULL OR
       NOT EXISTS (
         SELECT 1
         FROM hogan_credentials
         WHERE id = resource_hogan_credentials.hogan_credential_id
       ))
      AND
      (
        resource_hogan_credentials.resource_id IS NULL OR
        (
          resource_hogan_credentials.resource_type = 'UserAssessment' AND
          NOT EXISTS (
            SELECT 1
            FROM user_assessments
            WHERE id = resource_hogan_credentials.resource_id
          )
        ) OR
        (
          resource_hogan_credentials.resource_type = 'UserReport' AND
          NOT EXISTS (
            SELECT 1
            FROM user_reports
            WHERE id = resource_hogan_credentials.resource_id
          )
        ) OR
        resource_hogan_credentials.resource_type NOT IN ('UserAssessment', 'UserReport')
      )
    SQL
    mapping['communication_email_resources'] =
      'communication_email_resources.communication_email_id IS NULL OR ' \
      'NOT EXISTS (SELECT 1 FROM communication_emails WHERE id = communication_email_resources.communication_email_id)'
    mapping['profile_fields'] =
      'profile_fields.profile_setting_id IS NULL OR NOT EXISTS (SELECT 1 FROM profile_settings WHERE id = profile_fields.profile_setting_id)'
    mapping['profile_field_values'] =
      'profile_field_values.profile_field_id IS NULL OR NOT EXISTS (SELECT 1 FROM profile_fields WHERE id = profile_field_values.profile_field_id)'
    mapping['datasheet_column_preferences'] =
      "datasheet_column_preferences.resource_id IS NULL OR (datasheet_column_preferences.resource_type = 'Campaign' AND " \
      'NOT EXISTS (SELECT 1 FROM campaigns WHERE id = datasheet_column_preferences.resource_id))'
    mapping['active_storage_attachments'] =
      'active_storage_attachments.record_id IS NULL'

    mapping['clients'] =
      'clients.tte_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clients p WHERE p.id = clients.tte_id)'
    mapping['innovation_styles'] =
      'innovation_styles.dimension_id IS NULL OR NOT EXISTS (SELECT 1 FROM dimensions WHERE id = innovation_styles.dimension_id)'
    mapping['innovation_styles_factors'] =
      'innovation_styles_factors.innovation_style_id IS NULL OR NOT EXISTS (SELECT 1 FROM innovation_styles WHERE id = innovation_styles_factors.innovation_style_id)'
    mapping['occupations'] =
      'occupations.dimension_id IS NULL OR NOT EXISTS (SELECT 1 FROM dimensions WHERE id = occupations.dimension_id)'
    mapping['occupations_factors'] =
      'occupations_factors.occupation_id IS NULL OR NOT EXISTS (SELECT 1 FROM occupations WHERE id = occupations_factors.occupation_id)'
    mapping['saville_factors'] =
      'saville_factors.assessment_id IS NULL OR NOT EXISTS (SELECT 1 FROM assessments WHERE id = saville_factors.assessment_id)'
    mapping['saville_report_settings'] =
      'saville_report_settings.report_id IS NULL OR NOT EXISTS (SELECT 1 FROM reports WHERE id = saville_report_settings.report_id)'
    mapping['meeting_rooms'] =
      'meeting_rooms.meetable_id IS NULL OR ' \
      '(meeting_rooms.meetable_type = \'Campaign\' AND NOT EXISTS (SELECT 1 FROM campaigns WHERE id = meeting_rooms.meetable_id)) OR ' \
      '(meeting_rooms.meetable_type = \'UserAssessment\' AND NOT EXISTS (SELECT 1 FROM user_assessments WHERE id = meeting_rooms.meetable_id)) OR ' \
      '(meeting_rooms.meetable_type = \'Workshop\' AND NOT EXISTS (SELECT 1 FROM workshops WHERE id = meeting_rooms.meetable_id))'
    mapping['meeting_recordings'] =
      'meeting_recordings.meeting_room_id IS NULL OR NOT EXISTS (SELECT 1 FROM meeting_rooms WHERE id = meeting_recordings.meeting_room_id)'
    mapping['webhook_event_logs'] =
      'webhook_event_logs.subscription_id IS NULL OR NOT EXISTS (SELECT 1 FROM webhook_subscriptions WHERE id = webhook_event_logs.subscription_id)'
    mapping['webhook_subscription_topics'] =
      'webhook_subscription_topics.subscription_id IS NULL OR NOT EXISTS (SELECT 1 FROM webhook_subscriptions WHERE id = webhook_subscription_topics.subscription_id)'
    mapping['user_profiles'] =
      'user_profiles.user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = user_profiles.user_id)'
    mapping['privacy_consents'] =
      'privacy_consents.membership_id IS NULL OR NOT EXISTS (SELECT 1 FROM memberships WHERE id = privacy_consents.membership_id)'
    mapping['user_bookings'] =
      'user_bookings.user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = user_bookings.user_id)'
    mapping['system_check_sessions'] =
      'system_check_sessions.user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = system_check_sessions.user_id)'
    mapping['system_check_records'] =
      'system_check_records.system_check_session_id IS NULL OR NOT EXISTS (SELECT 1 FROM system_check_sessions WHERE id = system_check_records.system_check_session_id)'
    mapping['vector_embeddings'] =
      'vector_embeddings.resource_id IS NULL'

    mapping['taggings'] =
      'taggings.taggable_id IS NULL OR taggings.taggable_type IS NULL'
    mapping['versions'] =
      'versions.item_id IS NULL OR versions.item_type IS NULL'
    mapping['version_associations'] =
      'version_associations.version_id IS NULL OR NOT EXISTS (SELECT 1 FROM versions WHERE id = version_associations.version_id)'

    mapping[table]
  end
  # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Layout/LineLength

  def yellow(text) = "\e[33m#{text}\e[0m"

  # ---------------------------------------------------------------------------
  desc 'Verify all tenant_id values are populated'
  task verify: :environment do
    conn = ActiveRecord::Base.connection

    # Tables where tenant_id must be 100% populated after backfill
    required_tables = %w[
      admin_roles
      ai_factor_scores
      ai_scoring_approval_settings
      assessors
      bulk_reports
      campaign_ai_artifact_dependencies
      campaign_ai_artifacts
      campaign_assessment_groups
      campaign_assessments
      campaign_assessor_assessment_factor_weights
      campaign_assessor_assessments
      campaign_factor_groups
      campaign_factor_values
      campaign_factors
      campaign_idp_dependencies
      campaign_idps
      campaign_options
      campaign_reports
      campaign_templates
      campaign_users
      campaigns
      clients
      client_auditlog_export_settings
      client_features
      client_privacy_settings
      communication_cc_users
      communication_email_resources
      communication_emails
      communications
      communications_assessments
      communications_users
      dashboards
      data_report_jobs
      data_reports
      design_settings
      factor_benchmark_scores
      hogan_credentials
      idp_report_pdfs
      idp_settings
      idp_templates
      iiht_user_assessments
      integrations
      interview_questions
      job_roles
      libraries
      license_usages
      licenses
      media_responses
      membership_grants
      memberships
      memberships_admin_roles
      mettl_assessments
      mettl_schedule_records
      mettl_user_assessments
      mhs_user_assessments
      pearson_user_assessments
      power_bi_settings
      privacy_settings
      proctoring_sessions
      profile_fields
      profile_field_values
      profile_settings
      project_assessments
      project_features
      project_licenses
      registration_codes
      registration_settings
      report_approval_settings
      saml_service_providers
      saml_settings
      saville_user_assessments
      security_settings
      sheet_columns
      sheet_row_data
      sheet_rows
      sheets
      simulation_user_assessments
      skill_aliases
      skillvue_user_assessments
      sms_histories
      sms_invites
      sms_records
      smtp_settings
      text_module_overrides
      threesixty_campaigns
      threesixty_email_histories
      threesixty_email_schedules
      threesixty_email_templates
      threesixty_evaluators
      threesixty_instruction_templates
      threesixty_nomination_requirements
      threesixty_options
      threesixty_reminder_histories
      threesixty_subjects
      user_assessment_factor_scores
      user_assessment_verification_images
      user_assessment_verification_media
      user_assessments
      user_idp_comments
      user_idp_development_actions
      user_idp_plans
      user_idp_skills
      user_reflection_question_answers
      user_report_comments
      user_report_events
      user_report_pdfs
      user_reports
      users_results
      webhook_event_logs
      webhook_subscription_topics
      webhook_subscriptions
      workshop_assessors
      workshop_invite_logs
      workshop_invited_subjects
      workshop_invites
      workshop_managers
      workshop_resources
      workshop_subjects
      workshops
      yoodli_user_assessments
    ]

    # Tables where NULL tenant_id is acceptable (hybrid/global records)
    hybrid_tables = %w[
      active_storage_attachments
      agiles
      admin_jobs
      ai_assistant_chats
      ai_assistant_output_schema_keys
      ai_assisted_user_sessions
      assessment_assistants
      assessment_consent_settings
      assessments_reports
      assessments
      blocks
      dimensions
      factors
      factors_sub_factors
      factors_scoring
      highlights
      questions
      reports_campaign_ai_artifacts
      reports_campaign_factors
      reports_filters
      reports_modules
      reports_pages
      resource_hogan_credentials
      ai_translation_results
      bulk_reports
      client_ai_assistants
      communications_copy_memberships
      communications_memberships
      datasheet_column_preferences
      development_actions
      factors_aliases
      factors_norms
      hogan_logs
      hogan_report_settings
      idp_template_development_actions
      idp_template_interview_questions
      idp_template_reflection_questions
      idp_template_skills
      innovation_styles
      innovation_styles_factors
      job_groups
      meeting_recordings
      meeting_rooms
      norms
      occupations
      occupations_factors
      notifications
      privacy_consents
      proficiency_levels
      question_recoding
      reflection_questions
      relationships
      reports
      skill_groups
      skills
      skills_development_actions
      skills_job_roles
      skillvue_assessments
      taxonomy_levels
      transcriptions
      user_bookings
      user_profiles
      users
      vector_embeddings
      system_check_sessions
      system_check_records
      taggings
      versions
      version_associations
    ]

    failures = []
    orphans  = []
    errors   = []

    existing_tables = conn.tables

    required_tables.each do |table|
      next unless existing_tables.include?(table)

      begin
        null_count = conn.select_value("SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL").to_i
        next if null_count.zero?

        total = conn.select_value("SELECT COUNT(*) FROM #{table}").to_i

        orphan_count = 0
        orphan_sql = orphan_sql_for(table)
        if orphan_sql
          orphan_count = conn.select_value(
            "SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL AND (#{orphan_sql})"
          ).to_i
        end

        real_failures = null_count - orphan_count
        orphans << { table: table, orphan_count: orphan_count, total: total } if orphan_count.positive?
        failures << { table: table, null_count: real_failures, total: total } if real_failures.positive?
      rescue StandardError => e
        errors << { table: table, message: e.message }
      end
    end

    hybrid_results = hybrid_tables.filter_map do |table|
      next unless existing_tables.include?(table)

      begin
        null_count = conn.select_value("SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL").to_i
        total      = conn.select_value("SELECT COUNT(*) FROM #{table}").to_i
        orphan_count = 0
        orphan_sql = orphan_sql_for(table)
        if orphan_sql
          orphan_count = conn.select_value(
            "SELECT COUNT(*) FROM #{table} WHERE tenant_id IS NULL AND (#{orphan_sql})"
          ).to_i
        end
        { table: table, null_count: null_count, orphan_count: orphan_count, total: total }
      rescue StandardError => e
        errors << { table: table, message: e.message }
        nil
      end
    end

    ok_count = required_tables.size - failures.size - errors.size

    puts "\n=== Tenant ID Verification ===\n\n"

    required_tables.each do |table|
      next unless existing_tables.include?(table)

      f = failures.find { |x| x[:table] == table }
      o = orphans.find { |x| x[:table] == table }
      e = errors.find { |x| x[:table] == table }

      msgs = []
      msgs << "ERROR: #{e[:message]}" if e
      msgs << "#{f[:null_count]}/#{f[:total]} missing tenant_id" if f
      msgs << "#{o[:orphan_count]}/#{o[:total]} orphaned" if o

      icon = if e || f
               red('✗')
             elsif o
               yellow('⚠')
             else
               green('✓')
             end
      suffix = msgs.any? ? "  (#{msgs.join(', ')})" : ''
      puts "  #{icon} #{table}#{suffix}"
    end

    hybrid_errors = errors.select { |e| hybrid_tables.include?(e[:table]) }
    if hybrid_errors.any?
      puts "\n  Hybrid table errors:"
      hybrid_errors.each do |e|
        puts "  #{red('✗')} #{e[:table]}  (ERROR: #{e[:message].split("\n").first})"
      end
    end

    if hybrid_results.any?
      puts "\n  Hybrid tables (nil tenant_id acceptable for global records):"
      hybrid_results.each do |h|
        puts "  ~ #{h[:table]}: #{h[:null_count]}/#{h[:total]} nil tenant_id  (#{h[:orphan_count]} orphaned)"
      end
    end

    if orphans.any?
      total_orphaned = orphans.sum { |o| o[:orphan_count] }
      orphan_msg = "#{total_orphaned} total orphaned records across " \
                   "#{orphans.size} tables (parent deleted, safe to ignore)"
      puts "\n  #{yellow(orphan_msg)}"
    end

    # Translation tables are discovered dynamically. Rows that remain NULL after
    # backfill are either orphaned (parent deleted) or the parent itself has no
    # tenant_id — both are acceptable. Unresolvable NULLs are added to failures.
    translation_tables_with_tenant = conn.tables.select do |t|
      t.end_with?('_translations') && conn.column_exists?(t, :tenant_id)
    end

    translation_results = translation_tables_with_tenant.filter_map do |table|
      null_count = conn.select_value(
        "SELECT COUNT(*) FROM #{conn.quote_table_name(table)} WHERE tenant_id IS NULL"
      ).to_i
      next if null_count.zero?

      total  = conn.select_value("SELECT COUNT(*) FROM #{conn.quote_table_name(table)}").to_i
      fk_col = conn.columns(table).find { |c| c.name.end_with?('_id') }&.name

      orphan_count = if fk_col
                       parent_table = fk_col.delete_suffix('_id').pluralize
                       if conn.table_exists?(parent_table) && conn.column_exists?(parent_table, :tenant_id)
                         conn.select_value(<<~SQL.squish).to_i
                           SELECT COUNT(*) FROM #{conn.quote_table_name(table)}
                            WHERE tenant_id IS NULL
                              AND (#{conn.quote_column_name(fk_col)} IS NULL
                                   OR NOT EXISTS (
                                     SELECT 1 FROM #{conn.quote_table_name(parent_table)}
                                      WHERE id = #{conn.quote_table_name(table)}.#{conn.quote_column_name(fk_col)}
                                        AND tenant_id IS NOT NULL
                                   ))
                         SQL
                       else
                         null_count
                       end
                     else
                       null_count
                     end

      real_failures = null_count - orphan_count
      failures << { table: table, null_count: real_failures, total: total } if real_failures.positive?
      { table: table, null_count: null_count, orphan_count: orphan_count, total: total }
    end

    if translation_results.any?
      puts "\n  Translation tables:"
      translation_results.each do |h|
        f = failures.find { |x| x[:table] == h[:table] }
        if f
          puts "  #{red('✗')} #{h[:table]}: #{f[:null_count]}/#{h[:total]} unresolvable, #{h[:orphan_count]} orphaned"
        else
          puts "  ~ #{h[:table]}: #{h[:null_count]}/#{h[:total]} nil tenant_id  (#{h[:orphan_count]} orphaned)"
        end
      end
    end

    summary_parts = ["  Total: #{required_tables.size} tables", green("#{ok_count} passed")]
    summary_parts << yellow("#{orphans.size} orphaned") if orphans.any?
    summary_parts << red("#{failures.size} failed") unless failures.empty?
    summary_parts << red("#{errors.size} errors") unless errors.empty?
    puts "\n#{summary_parts.join('  |  ')}"

    result_line = failures.empty? && errors.empty? ? "\n#{green('PASSED ✓')}" : "\n#{red('FAILED ✗')}"
    puts result_line
  end

  # ---------------------------------------------------------------------------
  # tenant:backfill_audits
  #
  # Audits resolved by joining to each auditable type's own table, then
  # falling back to the audit's user record.
  #
  desc 'Backfill tenant_id for audits'
  task backfill_audits: :environment do
    mode = ENV['DRY_RUN'].present? ? :dry_run : :live
    dry_run = mode == :dry_run
    conn = ActiveRecord::Base.connection
    results = []

    puts "  [DRY RUN] No changes will be written\n" if dry_run

    backfill_audit_records(conn, results, dry_run)

    print_backfill_results(results, mode)
  end

  def backfill_audit_records(conn, results, dry_run)
    unless conn.column_exists?(:audits, :tenant_id)
      puts "  #{yellow('SKIP')} audits — tenant_id column missing, run migration first"
      return
    end

    backfill_audits_via_auditable_type(conn, results, dry_run)
    backfill_audits_via_user_fallback(conn, results, dry_run)
  end

  def backfill_audits_via_auditable_type(conn, results, dry_run)
    auditable_types = conn.select_values(
      'SELECT DISTINCT auditable_type FROM audits WHERE auditable_type IS NOT NULL AND tenant_id IS NULL'
    )

    auditable_types.each do |type|
      table = resolve_table_for_type(type)
      next unless table && conn.table_exists?(table) && conn.column_exists?(table, 'tenant_id')

      sql_template = <<~SQL.squish
        UPDATE audits
           SET tenant_id = t.tenant_id
          FROM #{conn.quote_table_name(table)} t
         WHERE t.id = audits.auditable_id
           AND audits.auditable_type = #{conn.quote(type)}
           AND audits.tenant_id IS NULL
           AND t.tenant_id IS NOT NULL
           AND t.id BETWEEN :start_id AND :end_id
      SQL

      results << backfill_in_batches(
        conn, 'audits', sql_template,
        batch_size: 20_000, dry_run: dry_run, label: "via #{type}", range_table: table
      )
    end
  end

  def backfill_audits_via_user_fallback(conn, results, dry_run)
    sql_template = <<~SQL.squish
      UPDATE audits
         SET tenant_id = u.tenant_id
        FROM users u
       WHERE u.id = audits.user_id
         AND audits.tenant_id IS NULL
         AND u.tenant_id IS NOT NULL
         AND u.id BETWEEN :start_id AND :end_id
    SQL

    results << backfill_in_batches(
      conn, 'audits', sql_template,
      batch_size: 20_000, dry_run: dry_run, label: 'via user_id fallback', range_table: 'users'
    )
  end

  def backfill_translation_tables(conn, results, dry_run)
    translation_tables = conn.tables.select { |t| t.end_with?('_translations') }

    translation_tables.each do |table|
      unless conn.column_exists?(table, :tenant_id)
        puts "  #{yellow('SKIP')} #{table} — tenant_id column missing, run migration first"
        next
      end

      fk_col = conn.columns(table).find { |c| c.name.end_with?('_id') }&.name
      next unless fk_col

      parent_table = fk_col.delete_suffix('_id').pluralize
      next unless conn.table_exists?(parent_table)
      next unless conn.column_exists?(parent_table, 'tenant_id')

      sql_template = <<~SQL.squish
        UPDATE #{conn.quote_table_name(table)}
           SET tenant_id = p.tenant_id
          FROM #{conn.quote_table_name(parent_table)} p
         WHERE p.id = #{conn.quote_table_name(table)}.#{conn.quote_column_name(fk_col)}
           AND #{conn.quote_table_name(table)}.tenant_id IS NULL
           AND p.tenant_id IS NOT NULL
           AND #{conn.quote_table_name(table)}.id BETWEEN :start_id AND :end_id
      SQL

      results << backfill_in_batches(conn, table, sql_template, dry_run: dry_run)
    end
  end

  desc 'Verify tenant_id in audits'
  task verify_audits: :environment do
    conn = ActiveRecord::Base.connection
    failures = []
    orphans  = []
    ok_count = 0

    # All remaining NULLs after backfill are orphaned records (auditable was deleted or
    # the record has no tenant context — e.g. global system audits). Treat as hybrid.
    if conn.table_exists?(:audits) && conn.column_exists?(:audits, :tenant_id)
      puts "\nVerifying audits table..."
      begin
        null_count = conn.select_value('SELECT COUNT(*) FROM audits WHERE tenant_id IS NULL').to_i
        total      = conn.select_value('SELECT COUNT(*) FROM audits').to_i
        if null_count.positive?
          orphans << { table: 'audits', orphan_count: null_count, total: total }
          puts "  ~ audits: #{null_count}/#{total} nil tenant_id  (#{null_count} orphaned)"
        else
          ok_count += 1
          puts "  #{green('✓ audits')}"
        end
      rescue StandardError => e
        failures << { table: 'audits', error: e.message }
        puts "  #{red("✗ audits: #{e.message}")}"
      end
    end

    if orphans.any?
      total_orphaned = orphans.sum { |o| o[:orphan_count] }
      puts "\n  #{yellow("#{total_orphaned} orphaned records (auditable deleted, safe to ignore)")}"
    end

    summary_parts = ['  Total: audits', green("#{ok_count} passed")]
    summary_parts << yellow("#{orphans.size} orphaned") if orphans.any?
    summary_parts << red("#{failures.size} failed") unless failures.empty?
    puts "\n#{summary_parts.join('  |  ')}"

    result_line = failures.empty? ? "\n#{green('PASSED ✓')}" : "\n#{red('FAILED ✗')}"
    puts result_line
  end

  def resolve_table_for_type(type)
    type.constantize.table_name
  rescue NameError
    nil
  end
end
