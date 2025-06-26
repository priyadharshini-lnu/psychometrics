# frozen_string_literal: true

class Api::V2::Administration::UserIdpPlanResource < Api::V2::Administration::BaseResource
  attributes :user_id, :idp_template_id, :campaign_id, :active, :creator_id, :status, :skill_gap_report_id,
             :skill_gap_report_available, :instructions

  has_one :idp_template
  has_many :skills, through: :user_idp_skills
  has_many :user_idp_development_actions
  has_many :user_idp_skills
  has_many :development_actions, through: :user_idp_development_actions

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
    locale = @model.user.locale || I18n.default_locale
    Mobility.with_locale(locale) do
      @model.idp_template&.instructions
    end
  end
end
