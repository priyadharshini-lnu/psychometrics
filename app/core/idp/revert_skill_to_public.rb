# frozen_string_literal: true

module Idp
  class RevertSkillToPublic < BaseCommand
    private_attr_accessor :user_idp_skill, :current_user

    def initialize(user_idp_skill, current_user)
      @user_idp_skill = user_idp_skill
      @current_user = current_user
    end

    def call
      unless user_idp_skill
        return broadcast :error,
                         I18n.t('administration.idp.revert_skill_to_public.errors.skill_not_found')
      end
      unless user_idp_skill.private?
        return broadcast :error,
                         I18n.t('administration.idp.revert_skill_to_public.errors.skill_already_public')
      end

      ActiveRecord::Base.transaction do
        user_idp_skill.update!(private: false)

        if should_trigger_approval_flow?
          trigger_approval_flow!
        end
      end

      broadcast :ok, {
        skill: user_idp_skill,
        message: success_message,
        requires_approval: should_trigger_approval_flow?
      }
    rescue ActiveRecord::RecordInvalid => e
      broadcast :error, e.message
    end

    private

    def should_trigger_approval_flow?
      user_idp_plan = user_idp_skill.user_idp_plan
      campaign = user_idp_plan.campaign

      return false unless campaign.project.idp_setting.manager_approves_idp?
      return false if user_idp_plan.completion_status_not_started? || user_idp_plan.draft?

      true
    end

    def trigger_approval_flow!
      user_idp_plan = user_idp_skill.user_idp_plan

      case user_idp_plan.approval_status
        when 'approved', 'rejected'
          user_idp_plan.update!(approval_status: :pending_approval)
      end

      case user_idp_plan.completion_status
        when 'in_progress', 'completed'
          user_idp_plan.update!(completion_status: :not_started) if user_idp_plan.approved?
      end
    end

    def success_message
      base_message = I18n.t('administration.idp.revert_skill_to_public.success.base_message',
                            skill_name: user_idp_skill.skill.name)

      if should_trigger_approval_flow?
        I18n.t('administration.idp.revert_skill_to_public.success.with_approval', base_message: base_message)
      else
        base_message
      end
    end
  end
end
