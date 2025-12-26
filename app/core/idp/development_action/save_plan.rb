# frozen_string_literal: true

module Idp::DevelopmentAction
  class SavePlan < BaseCommand
    private_attr_accessor :user_idp_plan, :user_idp_development_actions_params, :current_user

    def initialize(user_idp_plan, user_idp_development_actions_params, current_user)
      @user_idp_plan = user_idp_plan
      @user_idp_development_actions_params = user_idp_development_actions_params
      @current_user = current_user
    end

    def call
      ActiveRecord::Base.transaction do
        actions_by_skill = group_actions_by_skill

        actions_by_skill.each do |user_idp_skill_id, skill_actions|
          user_idp_skill = @user_idp_plan.user_idp_skills.find(user_idp_skill_id)

          ::Idp::Skill::AddDevelopmentActions.call!(
            user_idp_plan,
            user_idp_skill,
            skill_actions,
            current_user
          )
        end

        clean_up_orphaned_actions
      end

      user_idp_plan.touch if user_idp_plan.persisted?

      broadcast :ok
    end

    private

    def group_actions_by_skill
      user_idp_development_actions_params.group_by { |action| action['user_idp_skill_id'] }
    end

    def clean_up_orphaned_actions
      current_skill_ids = @user_idp_development_actions_params.filter_map { |action| action['user_idp_skill_id'] }.uniq

      user_idp_development_actions_to_cleanup = @user_idp_plan.user_idp_development_actions.joins(
        :user_idp_skill
      ).where.not(user_idp_skills: { id: current_skill_ids })

      if user_idp_plan.pre_submission?
        user_idp_development_actions_to_cleanup.destroy_all
      else
        destroy_or_soft_delete_user_idp_development_actions(user_idp_development_actions_to_cleanup)
      end
    end

    def destroy_or_soft_delete_user_idp_development_actions(user_idp_development_actions_to_cleanup)
      last_version = @user_idp_plan.versions.where(
        "object ->> 'approval_status' IN (?)", %w[approved rejected]
      ).last&.reify(has_many: true, mark_for_destruction: true)

      orphaned_user_idp_development_action_ids_to_destroy =
        last_version&.user_idp_development_actions&.
        select(&:marked_for_destruction?)&.
        map(&:id) || []

      user_idp_development_actions_to_cleanup.where(id: orphaned_user_idp_development_action_ids_to_destroy).destroy_all

      user_idp_development_actions_to_cleanup.where.not(
        id: orphaned_user_idp_development_action_ids_to_destroy
      ).find_each do |orphaned_action|
        orphaned_action.soft_delete!(current_user)
      end
    end
  end
end
