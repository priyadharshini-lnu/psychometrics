# frozen_string_literal: true

class EndUser::UserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState
  layout 'layouts/end_user'

  initial_state_for %i[show pass begin]
  before_action :set_user_assessment, only: %i[assessment details show pass begin]
  before_action :can_start_based_on_sequencing, only: %i[pass show begin]
  before_action :ensure_user_confirm, only: %i[pass begin]

  def assessment
    @selected_locale = @user_assessment.selected_locale || user_locale

    render json: AssessmentSerializer.new(
      context: {
        selected_locale: @selected_locale,
        piped_text_context: build_piped_context,
        include: '**'
      }
    ).serialize(@user_assessment.assessment)
  end

  def show
    @user_assessment.update(last_activity_at: DateTime.current)

    @selected_locale = @user_assessment.selected_locale || user_locale
    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: ::EndUser::DetailedUserAssessmentSerializer.new(
          context: { current_user: current_user }
        ).serialize(@user_assessment)
      end
    end
  end

  def pass
    lang = params[:lang] || @user_assessment.selected_locale || user_locale
    if @current_project.available_locales.include?(lang.to_s)
      cookies[:locale] = lang
      current_user&.user_profile&.update(locale: lang)
    end
    set_locale

    UserAssessments::Pass.call!(@user_assessment, lang)

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
    end
  end

  def begin
    lang = params[:lang] || @user_assessment.selected_locale || user_locale
    if @current_project.available_locales.include?(lang.to_s)
      cookies[:locale] = lang
      current_user&.user_profile&.update(locale: lang)
    end
    set_locale

    UserAssessments::Begin.call!(@user_assessment, lang)

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
    end
  end

  private

  def ensure_user_confirm
    if UserAssessments::CanStart.call!(@user_assessment, current_user, cookies)
      redirect_to user_assessment_path(@user_assessment)
    end
  end

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def build_piped_context
    {
      evaluator: current_user,
      subject: current_user,
      threesixty_campaign: {},
      campaign: @user_assessment.campaign,
      result: @user_assessment.users_result
    }
  end

  def set_user_assessment
    @user_assessment = UserAssessment.joins(:campaign).
                       find_by!(
                         id: params[:id],
                         evaluator_id: current_user.id,
                         campaigns: { status: :active }
                       )
    if request.format.html? && @user_assessment.closed?
      redirect_to assessment_completed_path(@user_assessment.campaign_id, user_assessment_id: @user_assessment.id)
    end
  end
end
