# frozen_string_literal: true

module EndUser
  class UserIdpPlansController < ApplicationController
    include AsyncRequestHandler
    include UserReports::IdpReportGeneration

    skip_before_action :authenticate_user!, only: [:pdf_preview]

    before_action :load_user_idp_plan, only: %i[
      show
      update
      update_reflection_questions
      download
      pdf_preview
      update_approval_status
      plan_changes
      revert_to_last_approved
    ]

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

    def plan_changes
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      Idp::IdpPlan::CalculateDiff.call!(@user_idp_plan, current_user) do
        on(:ok) do |user_idp_plan, diff|
          render json: { user_id: user_idp_plan.user_id, plan_id: user_idp_plan.id, diff: diff }
        end
        on(:error) do |message|
          render json: { error: message }
        end
      end
    end

    def revert_to_last_approved
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      last_approved_version = @user_idp_plan.versions.where(
        "object ->> 'approval_status' = ?", 'approved'
      ).last

      unless last_approved_version
        return render json: { error: I18n.t('idp.user_idp_plans.errors.no_previous_approved_plan') },
                      status: :unprocessable_entity
      end

      refied_last_approved_version = @user_idp_plan.safe_reify(
        last_approved_version, has_many: true, mark_for_destruction: true
      )

      refied_last_approved_version.save!
      render json: { status: @user_idp_plan.status }
    end

    def update
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      form = ::Idp::UpdateStatusForm.from_params(update_params).
             with_context(current_user: current_user, user_idp_plan: @user_idp_plan)

      if form.save!
        render json: { status: @user_idp_plan.status, note: @user_idp_plan.review_note }
      else
        render json: { errors: form.errors.full_messages }, status: 422
      end
    end

    def update_reflection_questions
      authorize(current_user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)
      result = Idp::UpdateUserReflectionQuestions.call!(@user_idp_plan, params[:reflection_questions])
      unless result
        return render json: { error: t('idp.reflective_questions.already_completed') },
                      status: :unprocessable_entity
      end

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

    async_request :download, handler: ::Idp::AsyncDownload,
      permit_params: lambda { |params|
        {
          user_id: user.id,
          lang: params[:lang],
          include_reflective_questions: allow_include_reflective_questions?
        }
      }

    private

    def allow_include_reflective_questions?
      current_user == @user_idp_plan.user && params[:include_reflective_questions] == true
    end

    def user_reflection_question_answers
      @user_idp_plan.user_reflection_question_answers.group_by(&:reflection_question_id).transform_values do |answers|
        answers.map(&:answer).first
      end
    end

    def user
      @user ||= params[:user_id].present? ? User.find(params[:user_id]) : current_user
    end

    def resource
      @user_idp_plan
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
      params.permit(:status, :note)
    end
  end
end
