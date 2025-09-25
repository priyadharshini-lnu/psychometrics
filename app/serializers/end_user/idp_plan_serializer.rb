# frozen_string_literal: true

module EndUser
  class IdpPlanSerializer < Panko::Serializer
    attributes :status, :self_rating_enabled, :one_click_idp_enabled, :skill_gap_report_available,
               :reflection_questions, :unread_comments_count, :instructions,
               :user_idp_skills, :user_idp_development_actions
    delegate :instructions, :self_rating_enabled, :one_click_idp_enabled, to: :idp_template

    has_one :user, serializer: ::IdpUserSerializer

    private

    def user_idp_skills
      skills = object.user_idp_skills.includes(:skill)
      filtered_skills = viewing_as_manager? ? skills.public_skills : skills

      Panko::ArraySerializer.new(
        filtered_skills,
        each_serializer: EndUser::UserIdpSkillsSerializer,
        context: context
      ).to_a
    end

    def user_idp_development_actions
      development_actions = object.user_idp_development_actions.includes(:development_action, :user_idp_skill)
      filtered_actions = viewing_as_manager? ? development_actions.with_public_skills : development_actions

      Panko::ArraySerializer.new(
        filtered_actions,
        each_serializer: EndUser::UserIdpDevelopmentActionsSerializer,
        context: context
      ).to_a
    end

    def viewing_as_manager?
      return false unless context[:current_user]

      # Manager is viewing if current_user is not the IDP owner but is the employee's manager
      context[:current_user] != object.user &&
        context[:current_user] == object.user.manager
    end

    def unread_comments_count
      return 0 if context[:current_user].blank?

      object.unread_comments_count_by(context[:current_user])
    end

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
