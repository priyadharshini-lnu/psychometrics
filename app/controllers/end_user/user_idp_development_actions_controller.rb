# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsController < ApplicationController
    def index
      user_idp_development_action = user_idp_plan.user_idp_development_actions.includes(:development_action)

      render json: Panko::ArraySerializer.new(
        user_idp_development_action,
        each_serializer: EndUser::UserIdpDevelopmentActionsSerializer,
        context: {
          user_idp_plan: user_idp_plan
        }
      ).to_a
    end

    def user_idp_skills
      user_idp_skills = user_idp_plan.user_idp_skills.includes(:skill)

      render json: Panko::ArraySerializer.new(
        user_idp_skills,
        each_serializer: EndUser::UserIdpSkillsSerializer,
        context: {
          user_idp_plan: user_idp_plan
        }
      ).to_a
    end

    def available_development_actions
      available_development_actions = user_idp_plan.idp_template.development_actions

      render json: {
        available_development_actions: Panko::ArraySerializer.new(
          available_development_actions,
          each_serializer: EndUser::AvailableDevelopmentActionSerializer
        ).to_a
      }
    end

    def save_plan
      errors = validate_user_idp_development_action(user_idp_development_actions_params)
      if errors.empty?
        Idp::DevelopmentAction::SavePlan.call!(user_idp_plan, user_idp_development_actions_params)

        render json: :ok
      else
        render json: { errors: errors }, status: 422
      end
    end

    private

    def validate_user_idp_development_action(user_idp_development_actions_params)
      errors = {}
      user_idp_development_actions_params.each_with_index do |user_idp_development_action, index|
        form = Idp::DevelopmentAction::SavePlanForm.from_params(user_idp_development_action).
               with_context(user_idp_plan)
        next unless form.invalid?

        errors[index + 1] = form.errors.messages
      end
      errors
    end

    def user_idp_plan
      @user_idp_plan ||= current_user.active_user_idp_plan
    end

    def user_idp_development_actions_params
      params.require(:user_idp_development_action).map do |params|
        params.permit(
          :id,
          :user_idp_skill_id,
          :development_action_id,
          :custom_action,
          :start_date_time,
          :end_date_time,
          :private,
          :progress
        )
      end
    end
  end
end
