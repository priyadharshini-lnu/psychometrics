# frozen_string_literal: true

module EndUser
  class UserIdpPlansController < ApplicationController
    before_action :load_user_idp_plan, only: %i[show update]

    def summary
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      render json: DevelopmentPlanSummarySerializer.new.serialize(user)
    end

    def show
      authorize(current_user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      render json: {
        data: EndUser::IdpPlanSerializer.new.serialize(@user_idp_plan)
      }
    end

    def update
      authorize(current_user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      @user_idp_plan.update!(update_params)

      render json: {
        status: @user_idp_plan.status
      }
    end

    private

    def user
      User.find(params[:user_id])
    end

    def load_user_idp_plan
      @user_idp_plan = current_user.
                       association(:active_user_idp_plan).
                       scope.
                       includes(
                         user_idp_skills: :skill,
                         user_idp_development_actions: :development_action
                       ).
                       first
    end

    def update_params
      params.require(:user_idp_plan).permit(:status)
    end
  end
end
