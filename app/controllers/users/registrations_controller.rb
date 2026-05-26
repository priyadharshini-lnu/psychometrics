# frozen_string_literal: true

module Users
  class RegistrationsController < Devise::RegistrationsController
    layout 'devise'
    before_action :configure_permitted_parameters
    before_action :verify_recaptcha_or_redirect, only: [:create]
    helper_method :via_sms_invite_code?

    def new
      @form = if via_sms_invite_code?
                Users::Registration::WithSmsInviteCodeForm.new(sms_invite_code: params[:sms_invite_code])
              else
                Users::Registration::WithRegistrationCodeForm.new(registration_code: params[:code])
              end
    end

    def create
      @form = form_class.from_params(sign_up_params).with_context(project: @current_project)

      if @form.valid?
        registration_command_class.call(@form, @current_project) do
          on(:error) do
            @form.errors.delete(:base)
            @form.errors.add(:base, I18n.t('administration.clients.registration_codes.errors.license_issue'))
            respond_with @form
          end
          on(:ok) do |resource|
            audit!(
              :create,
              resource[:ok],
              user: resource[:ok],
              project: @current_project,
              payload: sign_up_params.except(:mobile_verification_token, :registration_code, :sms_invite_code)
            )
            flash[:notice] = t('devise.registrations.success.instruction')
            redirect_to new_user_session_path
          end
        end
      else
        respond_with @form
      end
    end

    protected

    def registration_command_class
      via_sms_invite_code? ? Users::Registration::WithSmsInviteCode : Users::Registration::WithRegistrationCode
    end

    def form_class
      via_sms_invite_code? ? Users::Registration::WithSmsInviteCodeForm : Users::Registration::WithRegistrationCodeForm
    end

    def via_sms_invite_code?
      params[:sms_invite_code].present? || sign_up_params[:sms_invite_code].present?
    end

    def via_registration_code?
      params['code'].present? || sign_up_params[:registration_code].present?
    end

    def after_sign_up_path_for(_resource)
      root_path
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up) do |u|
        u.permit(:email, :registration_code, :sms_invite_code, :first_name, :last_name, :mobile_number,
                 :mobile_verification_token)
      end
    end

    def verify_recaptcha_or_redirect
      return if SkipRecaptcha.call!(request)

      @current_project = GetProjectBySubdomain.call!(request.subdomain)
      return unless @current_project&.security_setting&.enable_recaptcha

      unless verify_recaptcha(response: params[:recaptcha_token])
        flash[:alert] = I18n.t('sessions.errors.recaptcha')
        redirect_to new_user_session_path and return
      end
    end
  end
end
