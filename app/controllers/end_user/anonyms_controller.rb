# frozen_string_literal: true

module EndUser
  class AnonymsController < ActionController::Base
    include ::Threesixty::InitialState
    include CookieNotice
    include SetLocale
    include ControllerUtilities
    include AuthenticateAnonymousUser
    include AssessmentUtilities
    include AddCookie

    layout 'layouts/end_user'

    protect_from_forgery with: :exception
    before_action :set_campaign_assessment
    before_action :authenticate_anonymous_user!, only: [:show]
    before_action :redirect_and_ensure_valid_assessment_locale, only: [:show]
    before_action :find_or_create_anonymous_user, only: [:show]
    initial_state_for :show
    before_action :perform_browser_check, only: [:show]
    before_action :set_user_assessment_and_result, only: [:show], if: -> { @campaign_assessment.present? }
    before_action :set_locale

    ANONYM_COOKIE_KEY = 'tte-anonym-payload'

    rescue_from Licenses::NotEnoughError, with: -> { redirect_to(action: 'error') && return }

    def show
      if @campaign_assessment.nil? || assessment.archived? || !@campaign_assessment.enable_universal_links?
        redirect_to(action: 'error') && return
      end

      if params[:lang]
        @user_assessment.update(selected_locale: params[:lang])

        if @current_project.available_locales.include?(params[:lang])
          add_cookie(:locale, params[:lang])
          current_user.user_profile.update_column(:locale, params[:lang])
        end
      end

      campaign_user = @campaign_assessment.campaign.campaign_users.find_by(user_id: current_user.id)
      campaign_user.update(started_at: Time.zone.now) unless campaign_user.started_at

      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
        format.json do
          if assessment.agile?
            render json: {
              assessment: { category: assessment.category },
              user_result: { agileUserAssessmentUrl: agile_user_assessment_path(@user_assessment),
                             agileUserAssessmentId: @user_assessment.id }
            }
          else
            render_assessment_and_result
          end
        end
      end
    end

    def restart
      cookies.delete(Users::AuthenticateAnonymousUser::ANONYM_COOKIE_KEY, domain: request.host)

      redirect_to anonym_pass_path(params[:assessment_key], lang: params[:lang] || 'en')
    end

    def error; end

    private

    def set_campaign_assessment
      @campaign_assessment = ::CampaignAssessment.find_by assessment_key: params[:assessment_key]
    end

    def assessment
      @assessment ||= @campaign_assessment&.assessment
    end

    def set_user_assessment_and_result
      @user_assessment = find_user_assessment
      if @user_assessment.nil?
        Users::CreateAnonymCampaignUser.call!(@campaign_assessment, @current_user)
        @user_assessment = find_user_assessment
      end
      @user_result = @user_assessment.users_result
    end

    def find_user_assessment
      UserAssessment.find_by(
        campaign_id: @campaign_assessment.campaign_id,
        assessment_id: @campaign_assessment.assessment_id,
        subject: @current_user,
        evaluator: @current_user
      )
    end

    def render_assessment_and_result
      @selected_locale = @user_assessment.selected_locale || user_locale

      serialized_assessment = AssessmentSerializer.new(
        context: {
          include: '**',
          selected_locale: @selected_locale,
          campaign_assessment: @campaign_assessment
        }
      ).serialize(assessment)

      serialized_results = UsersResultSerializer.new(
        context: {
          participant: @user_assessment,
          campaign: @campaign_assessment.campaign,
          current_user: @current_user,
          locale: @selected_locale, include: '**'
        }
      ).serialize(@user_result)

      render json: { assessment: serialized_assessment, user_result: serialized_results }
    end

    def perform_browser_check
      @browser_detections = helpers.detect_browser(request.user_agent)

      redirect_to upgrade_url unless @browser_detections.supported_browser?
    end

    def find_or_create_anonymous_user
      return if @campaign_assessment.nil?

      @current_user = @anonymous_user || Users::CreateAnonymCampaignUser.call!(@campaign_assessment)
      set_anonym_cookie(@current_user)
    end

    def set_anonym_cookie(user)
      cookie_payload = user.slice(:first_name, :last_name, :role, :email, :is_anonym)

      cookies[ANONYM_COOKIE_KEY] = {
        value: cookie_payload.to_json,
        domain: request.host,
        path: '/',
        expires: 1.hour.from_now,
        secure: !(Rails.env.test? || Rails.env.development?),
        httponly: !(Rails.env.test? || Rails.env.development?)
      }
    end

    # Provides the assessment context for locale validation
    def current_assessment
      assessment
    end

    def set_locale
      I18n.locale = ui_locale
    end

    def feature_flags
      # Some values can be null
      Settings.features.to_h.transform_values { |v| v == true }
    end
  end
end
