# frozen_string_literal: true

class EndUser::UserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState
  layout 'layouts/end_user'
  initial_state_for %i[pass]
  before_action :set_user_assessment, only: %i[assessment show pass]

  def assessment
    @selected_locale = @user_assessment.selected_locale || user_locale

    render json: @user_assessment.assessment,
           serializer: AssessmentSerializer,
           include: '**',
           selected_locale: @selected_locale,
           piped_text_context: build_piped_context
  end

  def show
    user_result = UsersResult.find_or_create_by(
      assessment_id: @user_assessment.assessment_id,
      campaign_id: @user_assessment.campaign_id,
      subject_id: @user_assessment.subject_id,
      evaluator_id: @user_assessment.evaluator_id
    ) do |result|
      init_result(result)
    end

    @selected_locale = @user_assessment.selected_locale || user_locale
    @user_assessment.update(users_result_id: user_result.id)

    render json: user_result, serializer: UsersResultSerializer,
                 campaign: @user_assessment.campaign, participant: @user_assessment,
                 current_user: current_user, locale: @selected_locale,
                 piped_text_context: build_piped_context,
                 include: '**'
  end

  def pass
    @user_assessment.update(selected_locale: params[:lang]) if params[:lang]

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
    end
  end

  private

  def init_result(result)
    result.assign_attributes(
      assessment_id: @user_assessment.assessment_id,
      status: :in_progress,
      last_activity_at: DateTime.current,
      expiry_date: @user_assessment.assessment.extra['timer']&.second&.from_now,
      answers: {}
    )
  end

  def build_piped_context
    {
      evaluator: current_user,
      subject: current_user,
      threesixty_campaign: {}
    }
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find(params[:id])
  end
end
