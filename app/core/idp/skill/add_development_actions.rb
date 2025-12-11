# frozen_string_literal: true

module Idp
  module Skill
    class AddDevelopmentActions < BaseCommand
      private_attr_accessor :user_idp_plan, :user_idp_skill, :development_actions_params, :current_user

      def initialize(user_idp_plan, user_idp_skill, development_actions_params, current_user)
        @user_idp_plan = user_idp_plan
        @user_idp_skill = user_idp_skill
        @development_actions_params = development_actions_params
        @current_user = current_user
      end

      def call
        ActiveRecord::Base.transaction do
          cleanup_removed_development_actions_for_skill

          development_actions_params.each do |development_action_params|
            if development_action_params['development_action_id'].present?
              update_or_create_development_action(development_action_params)
            else
              update_or_create_custom_development_action(development_action_params)
            end
          end
        end

        broadcast :ok
      end

      private

      def cleanup_removed_development_actions_for_skill
        actions_to_remove = user_idp_plan.user_idp_development_actions.
                            where(user_idp_skill_id: user_idp_skill.id).
                            where.not(
                              development_action_id: development_actions_params.
                                filter_map { |dap| dap['development_action_id'] }
                            ).
                            where.not(
                              id: development_actions_params.filter_map { |dap| dap['id'] }
                            )

        if user_idp_plan.pre_submission?
          actions_to_remove.destroy_all
        else
          actions_to_remove.find_each do |user_idp_development_action|
            user_idp_development_action.soft_delete!(current_user)
          end
        end
      end

      def update_or_create_development_action(development_action_params)
        record = ::UserIdpDevelopmentAction.find_or_initialize_by(
          development_action_id: development_action_params['development_action_id'],
          user_idp_skill_id: user_idp_skill.id,
          user_idp_plan_id: user_idp_plan.id
        )

        record.update!(action_params(development_action_params))
      end

      def update_or_create_custom_development_action(development_action_params)
        if development_action_params['id'].present?
          user_idp_development_action = ::UserIdpDevelopmentAction.find(development_action_params['id'])

          if user_idp_development_action.development_action.source_type != 'platform'
            user_idp_development_action.development_action.update!(
              name: development_action_params['name'],
              description: development_action_params['description'],
              learning_style: development_action_params['learning_style']
            )
          end

          user_idp_development_action.update!(action_params(development_action_params))
        else
          development_action = ::DevelopmentAction.create!(
            name: development_action_params['name'],
            description: development_action_params['description'],
            learning_style: development_action_params['learning_style'],
            development_action_type: development_action_params['development_action_type'] || 'default',
            owner: user_idp_plan,
            source_type: development_action_params['source_type'] || 'custom'
          )

          ::UserIdpDevelopmentAction.create!(
            development_action: development_action,
            user_idp_plan_id: user_idp_plan.id,
            **action_params(development_action_params)
          )
        end
      end

      def action_params(development_action_params)
        {
          user_idp_skill_id: @user_idp_skill.id,
          progress: development_action_params['progress'] || 0,
          start_date_time: development_action_params['start_date_time'],
          end_date_time: development_action_params['end_date_time'],
          private: development_action_params['private'] || false
        }
      end
    end
  end
end
