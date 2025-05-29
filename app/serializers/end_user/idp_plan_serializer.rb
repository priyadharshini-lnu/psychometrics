# frozen_string_literal: true

module EndUser
  class IdpPlanSerializer < Panko::Serializer
    attributes :status, :self_rating_enabled, :skill_gap_report_available, :reflection_questions
    delegate :self_rating_enabled, to: :idp_template

    has_many :user_idp_skills,
             serializer: EndUser::UserIdpSkillsSerializer

    has_many :user_idp_development_actions,
             serializer: EndUser::UserIdpDevelopmentActionsSerializer

    has_one :user, serializer: ::IdpUserSerializer

    private

    def reflection_questions
      Panko::ArraySerializer.new(
        idp_template.idp_template_reflection_questions,
        each_serializer: EndUser::ReflectionQuestionSerializer,
        context: context
      ).to_a
    end

    def skill_gap_report_available
      return context[:skill_gap_report_available] if context.key?(:skill_gap_report_available)

      idp_template_report_id = idp_template&.report_id
      return false if idp_template_report_id.blank?

      UserReport.exists?(
        user_id: object.user_id,
        report_id: idp_template_report_id,
        campaign_id: object.campaign_id,
        status: 'prepared'
      )
    end

    def idp_template
      object.idp_template
    end
  end
end
