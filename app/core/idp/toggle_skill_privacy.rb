# frozen_string_literal: true

module Idp
  class ToggleSkillPrivacy < BaseCommand
    private_attr_accessor :user_idp_skill, :current_user

    def initialize(user_idp_skill, current_user)
      @user_idp_skill = user_idp_skill
      @current_user = current_user
    end

    def call
      unless user_idp_skill
        return broadcast :error,
                         I18n.t('administration.idp.skills_privacy_messages.skill_not_found')
      end
      return broadcast :error, I18n.t('administration.idp.skills_privacy_messages.unauthorized') unless authorized?

      user_idp_skill.toggle_privacy!

      broadcast :ok, {
        skill: user_idp_skill,
        message: privacy_message
      }
    rescue ActiveRecord::RecordInvalid => e
      broadcast :error, e.message
    end

    private

    def authorized?
      return false unless user_idp_skill.user_idp_plan

      user = user_idp_skill.user
      user_idp_plan = user_idp_skill.user_idp_plan

      if user.manager == current_user
        user_idp_plan.editable? && user_idp_plan.manager_editable?
      else
        user_idp_plan.editable? && user == current_user
      end
    end

    def privacy_message
      if user_idp_skill.private
        I18n.t('administration.idp.skills_privacy_messages.made_private', skill_name: user_idp_skill.skill.name)
      else
        I18n.t('administration.idp.skills_privacy_messages.made_public', skill_name: user_idp_skill.skill.name)
      end
    end
  end
end
