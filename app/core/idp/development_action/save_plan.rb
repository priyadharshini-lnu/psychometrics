# frozen_string_literal: true

module Idp::DevelopmentAction
  class SavePlan < BaseCommand
    private_attr_accessor :user_idp_plan, :user_idp_development_actions_params

    def initialize(user_idp_plan, user_idp_development_actions_params)
      @user_idp_plan = user_idp_plan
      @user_idp_development_actions_params = user_idp_development_actions_params
    end

    def call
      ActiveRecord::Base.transaction do
        actions_by_skill = group_actions_by_skill

        actions_by_skill.each do |user_idp_skill_id, skill_actions|
          user_idp_skill = @user_idp_plan.user_idp_skills.find(user_idp_skill_id)

          ::Idp::Skill::AddDevelopmentActions.call!(
            user_idp_plan,
            user_idp_skill,
            skill_actions
          )
        end

        clean_up_orphaned_actions
      end

      broadcast :ok
    end

    private

    def group_actions_by_skill
      user_idp_development_actions_params.group_by { |action| action['user_idp_skill_id'] }
    end

    def clean_up_orphaned_actions
      current_skill_ids = @user_idp_development_actions_params.filter_map { |action| action['user_idp_skill_id'] }.uniq

      @user_idp_plan.user_idp_development_actions.
        joins(:user_idp_skill).
        where.not(user_idp_skills: { id: current_skill_ids }).
        destroy_all
    end
  end
end
