# frozen_string_literal: true

class Api::V2::Administration::CampaignResource < Api::V2::Administration::BaseResource
  attributes :name, :project_id, :type, :status

  has_one :default_idp_template, foreign_key_on: :default_idp_template_id
  has_one :dashboard, foreign_key_on: :related
  has_one :threesixty_campaign, foreign_key_on: :related
  has_many :campaign_assessments, foreign_key_on: :related
  has_many :campaign_reports, foreign_key_on: :related

  def meta_details
    {
      permissions: common_campaign_permissions
    }
  end

  def common_campaign_permissions
    # rubocop:disable Metrics/BlockLength
    lambda {
      GetPermissionsHash.call!(
        Administration::CampaignPolicy,
        context[:user],
        @model,
        [
          'edit',
          'copy',
          %w[delete destroy],
          'manage_campaign_admins',
          %w[manage_options update_campaign_options],
          'manage_campaigns',
          'view_registration_codes',
          'view_datasheets',
          'view_sms_invites',
          'view_dashboard',
          'view_accesssheet',
          'view_accesssheet_settings',
          'view_assessors',
          'view_workshops',
          'view_workshop_invites',
          'stats',
          'pdf_password',
          'view_campaign_scoring',
          'view_campaign_scoring_setting',
          'manage_campaign_scoring',
          'view_assessments_and_reports',
          'manage_report_approval_settings',
          'export_dashboard_to_file',
          'view_ai_artifacts'
        ],
        {
          project_id: @model.project_id,
          campaign_id: @model.id
        }
      )
    }
    # rubocop:enable Metrics/BlockLength
  end
end
