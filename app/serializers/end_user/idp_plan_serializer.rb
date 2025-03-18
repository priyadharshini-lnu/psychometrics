# frozen_string_literal: true

module EndUser
  class IdpPlanSerializer < Panko::Serializer
    attributes :status, :self_rating_enabled, :skill_gap_report_available
    delegate :self_rating_enabled, to: :idp_template

    has_many :user_idp_skills,
             serializer: EndUser::UserIdpSkillsSerializer

    has_many :user_idp_development_actions,
             serializer: EndUser::UserIdpDevelopmentActionsSerializer

    private

    def skill_gap_report_available
      context[:skill_gap_report_available] || UserReport.find_by(
        user_id: object.user_id, report_id: idp_template.report_id, campaign_id: object.campaign_id
      )&.prepared?
    end

    def idp_template
      object.idp_template
    end
  end
end
