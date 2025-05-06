# frozen_string_literal: true

module EndUser
  class UserIdpPlansController < ApplicationController
    before_action :load_user_idp_plan, only: %i[show update]
    before_action :load_skill_gap_report_status, only: %i[show]

    def summary
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      render json: DevelopmentPlanSummarySerializer.new.serialize(user)
    end

    def show
      authorize(current_user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      if @user_idp_plan
        render json: {
          data: EndUser::IdpPlanSerializer.new(
            context: {
              skill_gap_report_available: @skill_gap_report_available
            }
          ).serialize(@user_idp_plan)
        }
      else
        render json: { errors: [I18n.t('idp_templates.errors.user_idp_template_not_found')] }, status: :not_found
      end
    end

    def update
      authorize(current_user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      if update_params[:status] == 'completed'
        @user_idp_plan.update!(status: 'completed', completed_at: Time.current)
      elsif update_params[:status] == 'in_progress'
        @user_idp_plan.update!(status: 'in_progress', started_at: Time.current)
      else
        @user_idp_plan.update!(update_params)
      end

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
                         :idp_template,
                         user_idp_skills: :skill,
                         user_idp_development_actions: :development_action
                       ).
                       first
    end

    def load_skill_gap_report_status
      @skill_gap_report_available = UserReport.find_by(
        user_id: @user_idp_plan.user_id,
        report_id: @user_idp_plan.idp_template.report_id,
        campaign_id: @user_idp_plan.campaign_id
      )&.prepared?
    end

    def update_params
      params.require(:user_idp_plan).permit(:status)
    end
  end
end
