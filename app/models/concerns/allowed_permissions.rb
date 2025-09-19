# frozen_string_literal: true

# rubocop:disable Metrics/ModuleLength

module AllowedPermissions
  extend ActiveSupport::Concern

  CLIENT_ADMIN_PERMISSIONS = {
    'clients' => %w[view view_licenses export_data_report],
    'projects' => %w[view manage manage_admins manage_users],
    'users' => ['reset_password'],
    'project_settings' => %w[
      design
      smtp
      saml
      integrations
      security
      webhooks
      assessments
      privacy_settings
      idp
    ],
    'audit_reports' => %w[user_report_events admin_permissions],
    'registration_settings' => %w[
      manage
    ],
    'dashboards' => %w[view accesssheet_view accesssheet_manage accesssheet_settings export],
    'sms_invites' => %w[view manage],
    'sms_histories' => %w[view],
    'campaigns' => %w[
      view
      manage
      manage_users
      manage_admins
      manage_options
      manage_messages
      participant_options
      reset_nominations
      report_options
      manage_report_approvals
      view_stats
      manage_factor_benchmark_scores
      view_factor_benchmark_scores
    ],
    'campaign_factors' => %w[view manage],
    'messages' => %w[email instructions options],
    'norms' => %w[view manage],
    'dimensions' => %w[view manage],
    'assessments' => %w[view manage],
    'questions' => %w[view manage],
    'libraries' => %w[view manage],
    'communications' => %w[view manage],
    'reports' => %w[view manage],
    'results' => %w[
      view_report
      download_report
      report_data
      raw_responses
      scores
      reset_responses
      approve_report
      rescore_responses
      reset_progress
      regenerate_report
      bulk_regenerate_reports
      finalize_scores
      external_score_import
      report_file_upload
      normalize_factor_scores
      export_occupations
      bulk_download
      bulk_update_evaluation_status
    ],
    'assessors' => %w[view manage],
    'registration_codes' => %w[view manage],
    'datasheets' => %w[view manage],
    'auditLogs' => ['view'],
    'workshops' => %w[view manage export_status view_recordings],
    'idp_templates' => %w[view manage],
    'proficiency_levels' => %w[view manage import export import_translations export_translations],
    'job_roles' => %w[view manage import_translations export_translations],
    'reflection_questions' => %w[view manage import export],
    'skills' => %w[view manage import export import_translations export_translations],
    'development_actions' => %w[view manage import export import_translations export_translations]
  }.freeze

  PROJECT_ADMIN_PERMISSIONS = {
    'clients' => ['view'],
    'projects' => %w[view manage_users],
    'users' => ['reset_password'],
    'project_settings' => %w[
      design
      smtp
      saml
      integrations
      security
      webhooks
      privacy_settings
      idp
    ],
    'audit_reports' => %w[user_report_events admin_permissions],
    'registration_settings' => %w[
      manage
    ],
    'campaigns' => %w[
      view
      manage
      manage_users
      manage_admins
      manage_options
      manage_messages
      participant_options
      reset_nominations
      report_options
      manage_report_approvals
      view_stats
      manage_factor_benchmark_scores
      view_factor_benchmark_scores
    ],
    'campaign_factors' => %w[view manage],
    'dashboards' => %w[view accesssheet_view accesssheet_manage accesssheet_settings export],
    'messages' => %w[email instructions options],
    'sms_invites' => %w[view manage],
    'sms_histories' => %w[view],
    'results' => %w[
      view_report
      download_report
      report_data
      raw_responses
      scores
      reset_responses
      edit_report
      approve_report
      rescore_responses
      reset_progress
      regenerate_report
      bulk_regenerate_reports
      finalize_scores
      external_score_import
      report_file_upload
      normalize_factor_scores
      export_occupations
      bulk_download
      bulk_update_evaluation_status
    ],
    'registration_codes' => %w[view manage],
    'communications' => %w[view manage],
    'assessors' => %w[view manage],
    'reports' => %w[view manage],
    'datasheets' => %w[view manage],
    'workshops' => %w[view manage export_status view_recordings],
    'idp_templates' => %w[view manage],
    'proficiency_levels' => %w[view manage import export import_translations export_translations],
    'skills' => %w[view manage import export import_translations export_translations],
    'job_roles' => %w[view manage import_translations export_translations],
    'development_actions' => %w[view manage import export import_translations export_translations],
    'reflection_questions' => %w[view manage import export]
  }.freeze

  CAMPAIGN_ADMIN_PERMISSIONS = {
    'users' => ['reset_password'],
    'assessors' => %w[view manage],
    'campaigns' => %w[
      view
      manage
      manage_users
      manage_options
      manage_report_approvals
      view_stats
    ],
    'audit_reports' => %w[user_report_events admin_permissions],
    'campaign_factors' => %w[view manage],
    'dashboards' => %w[view accesssheet_view accesssheet_manage accesssheet_settings export],
    'sms_invites' => %w[view manage],
    'sms_histories' => %w[view],
    'communications' => %w[view manage],
    'datasheets' => %w[view manage],
    'registration_codes' => %w[view manage],
    'results' => %w[
      view_report
      download_report
      report_data
      raw_responses
      scores
      reset_responses
      rescore_responses
      regenerate_report
      bulk_regenerate_reports
      finalize_scores
      view_stats
      external_score_import
      report_file_upload
      normalize_factor_scores
      export_occupations
      bulk_download
      bulk_update_evaluation_status
    ],
    'workshops' => %w[view manage view_recordings],
    'idp_templates' => %w[view manage],
    'job_roles' => %w[view],
    'proficiency_levels' => %w[view],
    'skills' => %w[view]
  }.freeze

  THREESIXTY_CAMPAIGN_ADMIN_PERMISSIONS = {
    'users' => ['reset_password'],
    'campaigns' => %w[
      view
      manage
      manage_users
      participant_options
      reset_nominations
      report_options
    ],
    'datasheets' => %w[view manage],
    'messages' => %w[email instructions options],
    'results' => %w[
      view_report
      download_report
      raw_responses
      reset_responses
      rescore_responses
      regenerate_report
      bulk_regenerate_reports
      scores
      report_file_upload
      normalize_factor_scores
      export_occupations
      bulk_update_evaluation_status
    ]
  }.freeze

  PERMISSION_BY_ADMIN_TYPE = {
    'client_admin' => CLIENT_ADMIN_PERMISSIONS,
    'project_admin' => PROJECT_ADMIN_PERMISSIONS,
    'campaign_admin' => CAMPAIGN_ADMIN_PERMISSIONS,
    'threesixty_campaign_admin' => THREESIXTY_CAMPAIGN_ADMIN_PERMISSIONS
  }.freeze
end

# rubocop:enable Metrics/ModuleLength
