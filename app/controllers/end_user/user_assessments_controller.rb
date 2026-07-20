# frozen_string_literal: true

class EndUser::UserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState
  include AssessmentUtilities
  include AsyncRequestHandler
  include AddCookie

  layout 'layouts/end_user'

  prepend_before_action :authenticate_anonymous_user!
  initial_state_for %i[show pass begin]
  before_action :set_user_assessment,
                only: %i[assessment details show pass begin validate_session user_verification_media_upload_callback
                         upload_user_verification_media_url mark_completed proctoring_session finish_proctoring_session]

  async_request :proctoring_session, handler: UserAssessments::ProctoringSession,
    permit_params: ->(params) { params.require(:user_assessment).permit(:id) }
  async_request :finish_proctoring_session, handler: UserAssessments::FinishProctoringSession,
    permit_params: ->(params) { params.require(:user_assessment).permit(:id) }
  before_action :redirect_and_ensure_valid_assessment_locale, only: %i[pass begin]
  before_action :can_start_based_on_sequencing, only: %i[pass show begin]
  before_action :ensure_user_confirm, only: %i[pass begin]
  before_action :ensure_campaign_user_is_active

  def assessment
    @selected_locale = @user_assessment.selected_locale || user_locale

    if @user_assessment.caching_enabled?
      serialized = Assessments::CacheService.new(@user_assessment.assessment,
                                                 @selected_locale, build_piped_context,
                                                 @user_assessment.campaign_id).fetch_serialized_assessment
      render json: serialized
    else
      render json: AssessmentSerializer.new(
        context: {
          selected_locale: @selected_locale,
          piped_text_context: build_piped_context,
          include: '**',
          ignore_pipetext_substitution: true,
          campaign_id: @user_assessment.campaign_id
        }
      ).serialize(@user_assessment.assessment)
    end
  end

  def show
    @user_assessment.update(last_activity_at: DateTime.current)

    @selected_locale = params[:lang] || @user_assessment.selected_locale || user_locale
    @user_assessment.update(selected_locale: @selected_locale)
    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: ::EndUser::DetailedUserAssessmentSerializer.new(
          context: {
            current_user: current_user,
            campaign: @user_assessment.campaign,
            campaign_user: @user_assessment.campaign_user,
            piped_text_context: build_piped_context,
            generate_piped_text_mapping: true
          }
        ).serialize(@user_assessment)
      end
    end
  end

  def mark_completed
    @user_assessment.update(status: :completed, completed_at: Time.current)

    render json: ::EndUser::UserAssessmentSerializer.new(
      context: { current_user: current_user }
    ).serialize(@user_assessment), status: :ok
  end

  def pass
    lang = params[:lang] || @user_assessment.selected_locale || user_locale
    if @current_project.available_locales.include?(lang.to_s)
      add_cookie(:locale, lang)
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
      add_cookie(:locale, lang)
      current_user&.user_profile&.update(locale: lang)
    end
    set_locale

    UserAssessments::Begin.call!(@user_assessment, lang)

    respond_to do |format|
      format.html do
        if @user_assessment.assessment.agile?
          redirect_to agile_user_assessment_path(@user_assessment)
        else
          render 'end_user/users/dashboard', layout: 'layouts/end_user'
        end
      end
    end
  end

  def upload_user_verification_media_url
    media_type = params[:media_type].to_s
    return head :unprocessable_entity unless %w[video audio].include?(media_type)

    UserAssessmentVerificationMedia::GetMediaUploadUrl.call(@user_assessment, params['blob'], media_type) do
      on(:ok) { |data| render json: data }
      on(:error) do |error|
        render json: { error: error }, status: :bad_request
      end
    end
  end

  def user_verification_media_upload_callback
    media = @user_assessment.user_assessment_verification_media.find_by(id: params[:media_id])

    unless media
      render json: { error_message: 'Media not found' }, status: :not_found
      return
    end

    media.file = params[:asset_key]

    if media.save
      render json: { status: :ok }, status: :ok
    else
      error_message = media.errors.full_messages.join(', ')
      media.destroy
      render json: { error_message: error_message }, status: :unprocessable_entity
    end
  end

  def validate_session
    render json: { session_id: @user_assessment.evaluation_session_id }
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
      result: @user_assessment.users_result,
      assessment: @user_assessment.assessment
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

  def ensure_campaign_user_is_active
    raise Pundit::NotAuthorizedError if @user_assessment.campaign_user.disabled
  end

  # Provides the assessment context for locale validation
  def current_assessment
    @user_assessment.assessment
  end
end
