# frozen_string_literal: true

module EndUser
  class AnonymsController < ActionController::Base
    include ::Threesixty::InitialState
    include SetLocale
    include AuthenticateAnonymousUser
    layout 'layouts/end_user'

    protect_from_forgery with: :exception
    before_action :set_campaign_assessment
    before_action :authenticate_anonymous_user!, only: [:show]
    before_action :find_or_create_anonymous_user, only: [:show]
    initial_state_for :show
    before_action :perform_browser_check, only: [:show]
    before_action :set_user_assessment_and_result, only: [:show], if: -> { @campaign_assessment.present? }
    before_action :set_locale

    ANONYM_COOKIE_KEY = 'tte-anonym-payload'

    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/PerceivedComplexity
    def show
      redirect_to(action: 'error', reason: 'link_expired') && return if @campaign_assessment.nil?
      redirect_to(action: 'error', reason: 'archived') && return if assessment.archived?
      redirect_to(action: 'error', reason: 'not_active') && return unless @campaign_assessment.enable_universal_links?

      if params[:lang]
        @user_assessment.update(selected_locale: params[:lang])

        if @current_project.available_locales.include?(params[:lang])
          cookies[:locale] = params[:lang]
          current_user.update_column(:locale, params[:lang])
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
              user_result: { agileUserAssessmentUrl: agile_user_assessment_path(@user_assessment) }
            }
          else
            render_assessment_and_result
          end
        end
      end
    end

    # rubocop:enable Metrics/CyclomaticComplexity
    # rubocop:enable Metrics/PerceivedComplexity

    def restart
      cookies.delete(Users::AuthenticateAnonymousUser::ANONYM_COOKIE_KEY, domain: request.host)

      redirect_to anonym_pass_path(params[:assessment_key])
    end

    def error; end

    private

    def set_campaign_assessment
      @campaign_assessment = ::CampaignAssessment.find_by assessment_key: params[:assessment_key]
    end

    def assessment
      @assessment ||= @campaign_assessment.assessment
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

      serialized_assessment = AssessmentSerializer.new(assessment, selected_locale: @selected_locale,
                                                       campaign_assessment: @campaign_assessment).
                              to_hash(include: '**')

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
      @current_user = @anonymous_user || Users::CreateAnonymCampaignUser.call!(@campaign_assessment)
      set_anonym_cookie(@current_user)
    end

    def set_anonym_cookie(user)
      cookie_payload = user.slice(:first_name, :last_name, :role, :email, :is_anonym)

      cookies[ANONYM_COOKIE_KEY] = {
        value: cookie_payload.to_json,
        domain: request.host,
        path: '/',
        expires: 1.hour.from_now
      }
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
