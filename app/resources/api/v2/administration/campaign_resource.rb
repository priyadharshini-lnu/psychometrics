# frozen_string_literal: true

class Api::V2::Administration::CampaignResource < Api::V2::Administration::BaseResource
  attributes :name, :project_id, :type, :status, :tag_list

  add_tag_filter

  has_one :default_idp_template, foreign_key_on: :default_idp_template_id
  has_one :dashboard, foreign_key_on: :related
  has_one :threesixty_campaign, foreign_key_on: :related
  has_many :campaign_assessments, foreign_key_on: :related
  has_many :campaign_reports, foreign_key_on: :related

  def self.records(opts = {})
    super.includes(taggings: :tag)
  end

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
          'manage_ai_scoring_approval_settings',
          'export_dashboard_to_file',
          'view_ai_artifacts',
          'manage_idp_plans',
          %w[view_campaign index]
        ],
        {
          project_id: @model.project_id,
          campaign_id: @model.id
        }
      ).merge(communication_center_permissions)
    }
    # rubocop:enable Metrics/BlockLength
  end

  # Reuses Administration::ProjectPolicy#view_communication_center? (the same permission Client/Project
  # nav already consume) rather than defining a duplicate check on Administration::CampaignPolicy --
  # record is nil since that policy resolves entirely from project_id/campaign_id context, never record.
  def communication_center_permissions
    GetPermissionsHash.call!(
      Administration::ProjectPolicy,
      context[:user],
      nil,
      ['view_communication_center'],
      {
        project_id: @model.project_id,
        campaign_id: @model.id
      }
    )
  end

  def tag_list
    @model.all_tags_list
  end

  def tag_list=(tags)
    @model.save_tag_with_ownership(tags)
  end
end
