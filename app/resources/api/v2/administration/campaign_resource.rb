# frozen_string_literal: true

class Api::V2::Administration::CampaignResource < Api::V2::Administration::BaseResource
  attributes :name, :project_id, :default_idp_template_id

  has_one :default_idp_template, foreign_key_on: :default_idp_template_id
  has_one :dashboard, foreign_key_on: :related
  has_one :threesixty_campaign, foreign_key_on: :related

  def meta_details
    {
      permissions: @model.common? ? campaign_permissions : threesixty_permissions
    }
  end

  def campaign_permissions
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
          'manage_campaign_scoring'
        ],
        {
          project_id: @model.project_id,
          campaign_id: @model.id
        }
      )
    }
    # rubocop:enable Metrics/BlockLength
  end

  def threesixty_permissions
    lambda {
      GetPermissionsHash.call!(
        Administration::Threesixty::CampaignPolicy,
        context[:user],
        @model.threesixty_campaign,
        %w[
          edit_assessment
          manage_reports_options
        ],
        project_id: @model.project_id,
        campaign_id: @model.id
      ).transform_keys! { |k| k.camelcase(:lower) }
    }
  end
end
