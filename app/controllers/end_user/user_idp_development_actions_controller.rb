# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsController < ApplicationController
    def index
      authorize(user, nil, policy_class: ::EndUser::UserIdpDevelopmentActionPolicy)

      user_idp_development_action = user_idp_plan.user_idp_development_actions.includes(:development_action)

      serialized_user_idp_development_actions = Panko::ArraySerializer.new(
        user_idp_development_action,
        each_serializer: EndUser::UserIdpDevelopmentActionsSerializer,
        context: {
          user_idp_plan: user_idp_plan
        }
      ).to_a

      render json: {
        data: serialized_user_idp_development_actions,
        meta: {
          record_count: serialized_user_idp_development_actions.count
        }
      }
    end

    def user_idp_skills
      user_idp_skills = user_idp_plan.user_idp_skills.includes(:skill)

      serialized_user_idp_skills = Panko::ArraySerializer.new(
        user_idp_skills,
        each_serializer: EndUser::UserIdpSkillsSerializer,
        context: {
          user_idp_plan: user_idp_plan
        }
      ).to_a

      render json: {
        data: serialized_user_idp_skills,
        meta: {
          record_count: serialized_user_idp_skills.count
        }
      }
    end

    def available_development_actions
      available_development_actions = user_idp_plan.idp_template.development_actions
      selected_action_ids = user_idp_plan.user_idp_development_actions.pluck(:development_action_id)
      available_development_actions = available_development_actions.where.not(id: selected_action_ids)

      serialized_avaialable_development_actions = Panko::ArraySerializer.new(
        available_development_actions,
        each_serializer: EndUser::AvailableDevelopmentActionSerializer
      ).to_a

      render json: {
        data: serialized_avaialable_development_actions,
        meta: {
          record_count: serialized_avaialable_development_actions.count
        }
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
      @user_idp_plan ||= user.active_user_idp_plan
    end

    def user
      User.find(params[:user_id])
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
