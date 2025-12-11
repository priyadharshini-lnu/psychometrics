# frozen_string_literal: true

class Api::V2::Administration::UserIdpPlanResource < Api::V2::Administration::BaseResource
  attributes :user_id, :idp_template_id, :campaign_id, :active, :creator_id, :skill_gap_report_id,
             :skill_gap_report_available, :instructions, :status, :approval_status

  has_one :idp_template

  has_many :skills, relation_name: :public_skills
  has_many :user_idp_development_actions, relation_name: :public_user_idp_development_actions
  has_many :development_actions, relation_name: :public_development_actions
  has_many :user_idp_skills, relation_name: :public_user_idp_skills

  def skill_gap_report_id
    report_id = IdpTemplate.find_by(id: @model.idp_template_id)&.report_id
    return nil unless report_id

    UserReport.where(user_id: @model.user_id, report_id: report_id).first&.id
  end

  def skill_gap_report_available
    idp_template_report_id = @model.idp_template&.report_id
    return false if idp_template_report_id.blank?

    UserReport.exists?(
      user_id: @model.user_id,
      report_id: idp_template_report_id,
      campaign_id: @model.campaign_id,
      status: 'prepared'
    )
  end

  def instructions
    @model.idp_template&.instructions
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::UserIdpPlanPolicy,
          context[:user],
          @model,
          %w[reset],
          {
            project_id: @model.campaign.project_id,
            campaign_id: @model.campaign_id
          }
        )
      }
    }
  end
end
