# frozen_string_literal: true

module AllowedPermissions
  extend ActiveSupport::Concern

  CLIENT_ADMIN_PERMISSIONS = {
    'clients' => %w[view view_licenses],
    'projects' => %w[view manage manage_admins manage_users],
    'users' => ['reset_password'],
    'project_settings' => %w[
      design
      smtp
      saml
      integrations
      security
      webhooks
    ],
    'dashboards' => %w[view accesssheet_view accesssheet_manage accesssheet_settings],
    'sms_invites' => %w[view manage],
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
    ],
    'messages' => %w[email instructions options],
    'norms' => %w[view manage],
    'dimensions' => %w[view manage],
    'assessments' => %w[view manage],
    'questions' => %w[view manage],
    'media_libraries' => %w[view manage],
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
      report_file_upload
    ],
    'assessors' => %w[view manage],
    'registration_codes' => %w[view manage],
    'datasheets' => %w[view manage],
    'auditLogs' => ['view'],
    'workshops' => %w[view manage]
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
    ],
    'dashboards' => %w[view accesssheet_view accesssheet_manage accesssheet_settings],
    'messages' => %w[email instructions options],
    'sms_invites' => %w[view manage],
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
      report_file_upload
    ],
    'registration_codes' => %w[view manage],
    'communications' => %w[view manage],
    'assessors' => %w[view manage],
    'reports' => ['manage'],
    'datasheets' => %w[view manage],
    'workshops' => %w[view manage]
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
    ],
    'sms_invites' => %w[view manage],
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
      report_file_upload
    ],
    'workshops' => %w[view manage]
  }.freeze

  THREESIXTY_CAMPAIGN_ADMIN_PERMISSIONS = {
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
      report_file_upload
    ]
  }.freeze

  PERMISSION_BY_ADMIN_TYPE = {
    'client_admin' => CLIENT_ADMIN_PERMISSIONS,
    'project_admin' => PROJECT_ADMIN_PERMISSIONS,
    'campaign_admin' => CAMPAIGN_ADMIN_PERMISSIONS,
    'threesixty_campaign_admin' => THREESIXTY_CAMPAIGN_ADMIN_PERMISSIONS
  }.freeze
end
