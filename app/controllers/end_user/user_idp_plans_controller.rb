# frozen_string_literal: true

module EndUser
  class UserIdpPlansController < ApplicationController
    before_action :load_user_idp_plan, only: %i[show update update_reflection_questions]
    before_action :load_skill_gap_report_status, only: %i[show]

    def summary
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      render json: DevelopmentPlanSummarySerializer.new.serialize(user)
    end

    def show
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      if @user_idp_plan
        render json: {
          data: EndUser::IdpPlanSerializer.new(
            context: {
              skill_gap_report_available: @skill_gap_report_available,
              current_user: current_user,
              reflection_answers: user_reflection_question_answers
            }
          ).serialize(@user_idp_plan)
        }
      else
        render json: { errors: [I18n.t('idp_templates.errors.user_idp_template_not_found')] }, status: :not_found
      end
    end

    def update
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      form = ::Idp::UpdateStatusForm.from_params(update_params).
             with_context(current_user: current_user, user_idp_plan: @user_idp_plan)

      if form.save!
        render json: { status: @user_idp_plan.status }
      else
        render json: { errors: form.errors.full_messages }, status: 422
      end
    end

    def update_reflection_questions
      authorize(current_user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)
      Idp::UpdateUserReflectionQuestions.call!(@user_idp_plan, params[:reflection_questions])
      render json: {
        data: Panko::ArraySerializer.new(
          @user_idp_plan.idp_template.idp_template_reflection_questions,
          each_serializer: EndUser::ReflectionQuestionSerializer,
          context: {
            reflection_answers: user_reflection_question_answers
          }
        ).to_a
      }
    end

    private

    def allow_include_reflective_questions?
      current_user == @user_idp_plan.user && params[:include_reflective_questions] == 'true'
    end

    def user_reflection_question_answers
      @user_idp_plan.user_reflection_question_answers.group_by(&:reflection_question_id).transform_values do |answers|
        answers.map(&:answer).first
      end
    end

    def user
      @user ||= params[:user_id].present? ? User.find(params[:user_id]) : current_user
    end

    def load_user_idp_plan
      @user_idp_plan = user.
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
      return unless @user_idp_plan

      @skill_gap_report_available = UserReport.exists?(
        user_id: @user_idp_plan.user_id,
        report_id: @user_idp_plan.idp_template.report_id,
        campaign_id: @user_idp_plan.campaign_id,
        status: 'prepared'
      )
    end

    def update_params
      params.require(:user_idp_plan).permit(:status)
    end
  end
end
