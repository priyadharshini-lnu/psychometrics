# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsController < ApplicationController
    append_before_action :pundit_authorize
    before_action :load_user_idp_skill!, only: %i[generate_by_ai available_development_actions]

    def index
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
      development_actions = Idp::DevelopmentAction::AvailableActionsQuery.new(
        @user_idp_skill.skill,
        user_idp_plan
      ).query

      serialized_avaialable_development_actions = Panko::ArraySerializer.new(
        development_actions,
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
        Idp::DevelopmentAction::SavePlan.call!(user_idp_plan, user_idp_development_actions_params, current_user)

        render json: :ok
      else
        render json: { errors: errors }, status: 422
      end
    end

    def update_progress
      user_idp_development_action = user.user_idp_development_actions.find(progress_params[:id])

      if user_idp_development_action.user_idp_plan.completion_status_completed?
        render json: { errors: [I18n.t('idp.errors.cannot_update_progress_plan_completed')] }, status: 422
        return
      end

      if user_idp_development_action.update!(progress: progress_params[:progress])
        render json: user_idp_development_action, status: :ok
      else
        render json: { errors: user_idp_development_action.errors }, status: 422
      end
    end

    def generate_by_ai
      generative_service = DevelopmentActions::GenerativeService.new(@user_idp_skill, current_user,
                                                                     ai_generate_service_params)

      generative_service.
        on(:ok) do |generated_actions|
          render json: { data: generated_actions, skill_id: @user_idp_skill.skill_id }, status: :ok
        end.
        on(:error) do |error_message|
          render json: { errors: [error_message] }, status: 422
        end.
        call
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
      @user ||= params[:user_id].present? ? User.find(params[:user_id]) : current_user
    end

    def user_idp_development_actions_params
      return [] if params[:user_idp_development_action].empty?

      params.require(:user_idp_development_action).map do |params|
        params.permit(
          :id,
          :user_idp_skill_id,
          :development_action_id,
          :name,
          :description,
          :learning_style,
          :source_type,
          :start_date_time,
          :end_date_time,
          :private,
          :progress
        )
      end
    end

    def progress_params
      params.expect(user_idp_development_action: %i[id progress])
    end

    def load_user_idp_skill!
      @user_idp_skill = user.user_idp_skills.includes(:skill).find(params[:user_idp_skill_id])
    end

    def ai_generate_service_params
      params.permit(
        :user_idp_skill_id,
        :lang,
        :generate_more,
        generated_actions: %i[description learning_style]
      )
    end

    def pundit_authorize
      authorize(user, nil, policy_class: ::EndUser::UserIdpDevelopmentActionPolicy, user_idp_plan: user_idp_plan)
    end
  end
end
