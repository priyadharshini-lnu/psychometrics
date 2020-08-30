# frozen_string_literal: true

module EndUser
  class AnonymsController < ActionController::Base
    include ::Threesixty::InitialState
    include SetLocale
    include AuthenticateAnonymousUser
    layout 'layouts/end_user'

    protect_from_forgery with: :exception

    before_action :set_campaign_assessment
    before_action :perform_browser_check, only: [:show]
    before_action :authenticate_anonymous_user!, only: [:show]
    before_action :set_client, only: [:show]
    before_action :find_or_create_anonymous_user, only: [:show]
    before_action :find_or_create_user_assessment, only: [:show]

    ANONYM_COOKIE_KEY = 'tte-anonym-payload'

    def show
      redirect_to(action: 'error', reason: 'archived') && return if @campaign_assessment.assessment.archived?
      redirect_to(action: 'error', reason: 'not_active') && return unless @campaign_assessment.enable_universal_links?

      @user_assessment.update(selected_locale: params[:lang]) if params[:lang]

      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
        format.json do
          user_result = UsersResult.find_or_create_by(
            assessment_id: @campaign_assessment.assessment_id,
            campaign_id: @campaign_assessment.campaign_id,
            subject_id: @current_user.id,
            evaluator_id: @current_user.id
          ) do |result|
            init_result(result)
          end

          @selected_locale = user_result.selected_locale || user_locale
          @user_assessment.update(users_result_id: user_result.id)

          render json: user_result, serializer: UsersResultSerializer,
                       campaign: @campaign_assessment.campaign, participant: @user_assessment,
                       current_user: @current_user, locale: @selected_locale,
                       piped_text_context: build_piped_context,
                       include: '**'
        end
      end
    end

    def assessment
      @selected_locale = params[:lang] || user_locale

      render json: @campaign_assessment.assessment,
             serializer: AssessmentSerializer,
             include: '**',
             selected_locale: @selected_locale,
             piped_text_context: build_piped_context
    end

    def error; end

    private

    def find_or_create_user_assessment
      @user_assessment = UserAssessment.find_or_create_by(
        assessment_id: @campaign_assessment.assessment_id,
        campaign_id: @campaign_assessment.campaign_id,
        subject_id: @current_user.id,
        evaluator_id: @current_user.id
      )
    end

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

    def perform_browser_check
      @browser_detections = helpers.detect_browser(request.user_agent)

      redirect_to upgrade_url unless @browser_detections.supported_browser?
    end

    def set_campaign_assessment
      @campaign_assessment = ::CampaignAssessment.find_by assessment_key: params[:assessment_key]
    end

    def set_client
      @client = @campaign_assessment.campaign.client
      @current_client = @client.parent
    end

    def find_or_create_anonymous_user
      @current_user = @anonymous_user || create_anonym_user
      set_anonym_cookie(@current_user)
    end

    def create_anonym_user
      Users::CreateAnonymCampaignUser.call!(@campaign_assessment.campaign)
    end

    def set_anonym_cookie(user)
      cookie_payload = user.slice(:first_name, :last_name, :role, :email, :is_anonym)

      save_cookie(cookie_payload)
    end

    def save_cookie(payload, options = { expires: 1.hour.from_now }, name = ANONYM_COOKIE_KEY)
      cookies[name] = options.merge(
        value: payload.to_json,
        domain: request.host,
        path: '/'
      )
    end

    def delete_anonym_user_cookie
      cookies.delete(ANONYM_COOKIE_KEY, domain: request.fullpath)
    end
  end
end
