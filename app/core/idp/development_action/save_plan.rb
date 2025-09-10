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
        destroy_removed_user_idp_development_actions

        @user_idp_development_actions_params.each do |user_idp_development_action|
          if user_idp_development_action['development_action_id'].present?
            update_or_create_user_idp_development_action(user_idp_development_action)
          elsif user_idp_development_action['id'].blank?
            create_development_action(user_idp_development_action)
          else
            update_development_action(user_idp_development_action)
          end
        end
      end

      broadcast :ok
    end

    private

    def destroy_removed_user_idp_development_actions
      existing_record_ids = @user_idp_development_actions_params.filter_map { |obj| obj['id'] }.compact
      UserIdpDevelopmentAction.where(user_idp_plan_id: @user_idp_plan.id).where.not(id: existing_record_ids).destroy_all
    end

    def update_or_create_user_idp_development_action(user_idp_development_action)
      record = UserIdpDevelopmentAction.find_or_initialize_by(
        development_action_id: user_idp_development_action['development_action_id'],
        user_idp_skill_id: user_idp_development_action['user_idp_skill_id']
      )

      record.update!(action_params(user_idp_development_action))
    end

    def create_development_action(user_idp_development_action)
      development_action = DevelopmentAction.create!(
        name: user_idp_development_action['name'],
        description: user_idp_development_action['description'],
        learning_style: user_idp_development_action['learning_style'],
        owner: @user_idp_plan,
        source_type: user_idp_development_action['source_type'] || 'platform'
      )

      UserIdpDevelopmentAction.create!(
        development_action: development_action,
        user_idp_plan_id: @user_idp_plan.id,
        user_idp_skill_id: user_idp_development_action['user_idp_skill_id'],
        progress: user_idp_development_action['progress'],
        start_date_time: user_idp_development_action['start_date_time'],
        end_date_time: user_idp_development_action['end_date_time'],
        private: user_idp_development_action['private']
      )
    end

    def update_development_action(user_idp_development_action)
      record = UserIdpDevelopmentAction.find(user_idp_development_action['id'])

      if record.development_action&.source_type != 'platform'
        record.development_action.update!(
          name: user_idp_development_action['name'],
          description: user_idp_development_action['description'],
          learning_style: user_idp_development_action['learning_style']
        )
      end

      record.update!(action_params(user_idp_development_action))
    end

    def action_params(user_idp_development_action_params)
      {
        progress: user_idp_development_action_params['progress'],
        start_date_time: user_idp_development_action_params['start_date_time'],
        end_date_time: user_idp_development_action_params['end_date_time'],
        private: user_idp_development_action_params['private'],
        user_idp_skill_id: user_idp_development_action_params['user_idp_skill_id'],
        user_idp_plan_id: @user_idp_plan.id
      }
    end
  end
end
