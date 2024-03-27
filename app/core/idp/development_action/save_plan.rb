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
        user_idp_skills = @user_idp_plan.user_idp_skills.index_by(&:id)
        @user_idp_development_actions_params.each do |user_idp_development_action|
          user_idp_development_actions_attributes =
            transform_user_idp_development_action_attributes(
              user_idp_development_action[:user_idp_development_actions_attributes]
            )

          user_idp_skills[user_idp_development_action[:user_idp_skill_id]].
            update!(user_idp_development_actions_attributes: user_idp_development_actions_attributes)
        end
      end

      broadcast :ok
    end

    private

    def transform_user_idp_development_action_attributes(attr)
      attr.map { |object| object.merge(user_idp_plan_id: @user_idp_plan.id) }
    end
  end
end
