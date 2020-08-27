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
    user_result = @user_assessment.users_result
    user_result.update(status: :in_progress, last_activity_at: DateTime.current)

    @selected_locale = @user_assessment.selected_locale || user_locale

    render json: user_result, serializer: UsersResultSerializer,
                 campaign: @user_assessment.campaign, participant: @user_assessment,
                 current_user: current_user, locale: @selected_locale,
                 piped_text_context: build_piped_context,
                 include: '**'
  end

  def pass
    @user_assessment.users_result.update(selected_locale: params[:lang]) if params[:lang]

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
    end
  end

  private

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
