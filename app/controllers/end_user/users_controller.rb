# frozen_string_literal: true

class EndUser::UsersController < ApplicationController
  include ::Threesixty::InitialState
  include AddCookie

  layout 'layouts/end_user'
  before_action :skip_policy_scope
  before_action :set_locale, except: %i[change_locale]
  initial_state_for %i[dashboard]
  skip_before_action :authenticate_user!, only: %i[change_locale]
  prepend_before_action :verify_recaptcha_or_redirect, only: %i[change_password]

  def show
    redirect_to new_user_session_path
  end

  def dashboard
    # rubocop:disable Metrics/BlockLength
    respond_to do |format|
      format.html do
        render 'end_user/users/dashboard'
      end
      format.json do
        subject_campaigns = Threesixty::Subject.where(user_id: current_user.id).pluck(:campaign_id)
        evaluator_campaigns = Threesixty::Evaluator.where(user_id: current_user.id).pluck(:campaign_id)
        user_campaigns = current_user.campaign_users.where(active: true).pluck(:campaign_id) |
                         subject_campaigns | evaluator_campaigns

        campaigns = ::Campaign.where(id: user_campaigns).visible_to_end_user.
                    includes(
                      :threesixty_campaign,
                      :translations,
                      { campaign_options: :translations }
                    ).group_by(&:type)

        serializer_context = {
          current_user: current_user,
          system_check_session_id: cookies.signed[:system_check_session_id]
        }

        json = []
        if campaigns['common']
          json.concat(
            Panko::ArraySerializer.new(
              campaigns['common'],
              each_serializer: ::EndUser::ShortCampaignSerializer,
              context: serializer_context
            ).to_a
          )
        end

        if campaigns['threesixty']
          json.concat(serializer_campaign(campaigns['threesixty'].map(&:threesixty_campaign),
                                          Threesixty::EndUser::ShortCampaignSerializer,
                                          serializer_context))
        end

        render json: json
      end
    end
    # rubocop:enable Metrics/BlockLength
  end

  def policy
    render json: { content: I18n.t("privacy_policy.#{params[:version]}") }
  end

  def accept_privacy
    raise "Invalid Privacy consent version '#{params[:version]}' passed" if params[:version].blank?

    current_user.privacy_consents.create(
      version: params[:version],
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      locale: I18n.locale,
      campaign_id: params[:campaign_id],
      assessment_id: params[:assessment_id]
    )
    head :ok
  end

  def change_locale
    add_cookie(:locale, params[:locale]) if @current_project.available_locales.include?(params[:locale])
    set_locale
    current_user&.user_profile&.update(locale: I18n.locale)
  end

  def update_details
    form = Users::ProfileForm.from_params(params[:user]).with_context(user: current_user, project: @current_project)
    return render json: { errors: form.errors.messages }, status: 400 unless form.valid?

    if current_user.update(form.attributes.except(*UserProfile::PROFILE_FIELDS, :photo))
      current_user.user_profile.update!(form.attributes.slice(*(UserProfile::PROFILE_FIELDS - [:photo])))
      audit! :update_user_profile, current_user, project: @current_project, payload: form.attributes

      render json: ::EndUser::CurrentUserSerializer.new(
        context: { project_id: @current_project.id,
                   back_url: session[:back_url] }
      ).serialize(current_user)
      session.delete(:back_url)
    else
      render json: { errors: current_user.errors.messages }, status: 400
    end
  end

  def upload_photo
    if current_user.user_profile.update(photo: params[:photo])
      audit! :upload_photo, current_user, project: @current_project,
          payload: { photo_filename: params[:photo].original_filename }
      render json: { photo: current_user.user_profile.photo&.url }
    else
      render json: { errors: current_user.user_profile.errors.messages }, status: 400
    end
  end

  def change_password
    form = Users::ChangePasswordForm.from_params(params)
    return render json: { errors: form.errors.messages }, status: 422 unless form.valid?

    if current_user.update_with_password(form.attributes)
      audit! :change_password, current_user, user: current_user, project: @current_project,
        payload: { campaign_id: params[:campaign_id], assessment_id: params[:assessment_id] }
      sign_out(current_user)
      flash[:notice] = t('users.password_change_success')
      head :ok
    else
      render json: { errors: current_user.errors.messages }, status: 422
    end
  end

  def workshop
    respond_to do |format|
      format.json do
        workshop = Workshop.
                   includes(:workshop_subjects).
                   joins(:workshop_subjects).
                   merge(WorkshopSubject.participatable).
                   find_by(workshop_subjects: { user_id: current_user.id })

        if workshop
          render json: ::EndUser::WorkshopSerializer.new(context: { current_user: current_user }).serialize(workshop)
        else
          head :no_content
        end
      end
    end
  end

  def redirect_to_user_assessment
    user_assessment = UserAssessment.find_by!(
      campaign_id: params[:campaign_id], subject_id: current_user.id, assessment_id: params[:assessment_id]
    )

    redirect_to(user_assessment_path(user_assessment))
  end

  private

  def select_campaign_url(campaign)
    if campaign.threesixty?
      "/threesixty_campaigns/#{campaign.threesixty_campaign.id}"
    else
      campaign_path(campaign)
    end
  end

  def serializer_campaign(campaigns, serializer, context = {})
    Panko::ArraySerializer.new(
      campaigns,
      each_serializer: serializer,
      context: {
        current_user: current_user, include: '**'
      }.merge(context)
    ).to_a
  end

  def verify_recaptcha_or_redirect
    return if SkipRecaptcha.call!(request)

    @current_project = GetProjectBySubdomain.call!(request.subdomain)
    return unless @current_project&.security_setting&.enable_recaptcha

    unless verify_recaptcha(response: params[:recaptcha_token])
      render json: { errors: [{ detail: I18n.t('sessions.errors.recaptcha') }] }, status: 422 and return
    end
  end
end
