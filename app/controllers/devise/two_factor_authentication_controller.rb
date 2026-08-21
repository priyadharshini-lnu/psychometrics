# frozen_string_literal: true

require 'devise/version'

class Devise::TwoFactorAuthenticationController < DeviseController
  prepend_before_action :authenticate_scope!
  before_action :prepare_and_validate, :handle_two_factor_authentication

  layout :select_layout

  def show; end

  def update
    return render(:show) if params[:code].blank?

    if resource.authenticate_otp(params[:code])
      audit!(
        :two_factor_authentication,
        resource,
        user: resource,
        payload: { email: resource.email },
        outcome: 'successful'
      )
      after_two_factor_success_for(resource)
    else
      after_two_factor_fail_for(resource)
    end
  end

  def resend_code
    resource.reset_second_factor_attempts_counter!
    resource.send_new_otp
    redirect_to send(:"#{resource_name}_two_factor_authentication_path"), flash: {
      resent: I18n.t('devise.two_factor_authentication.code_has_been_sent')
    }
  end

  private

  def select_layout
    resource.project.present? ? 'devise' : 'administration/devise'
  end

  def after_two_factor_success_for(resource)
    siem_log_mfa_success(resource)
    set_remember_two_factor_cookie(resource)

    warden.session(resource_name)[TwoFactorAuthentication::NEED_AUTHENTICATION] = false
    # For compatability with devise versions below v4.2.0
    # https://github.com/plataformatec/devise/commit/2044fffa25d781fcbaf090e7728b48b65c854ccb
    if respond_to?(:bypass_sign_in)
      bypass_sign_in(resource, scope: resource_name)
    else
      sign_in(resource_name, resource, bypass: true)
    end
    resource.update_attribute(:second_factor_attempts_count, 0)

    redirect_to after_two_factor_success_path_for(resource)
  end

  def set_remember_two_factor_cookie(resource)
    expires_seconds = resource.class.remember_otp_session_for_seconds

    if expires_seconds&.positive?
      cookies.signed[TwoFactorAuthentication::REMEMBER_TFA_COOKIE_NAME] = {
        value: "#{resource.class}-#{resource.public_send(Devise.second_factor_resource_id)}",
        expires: expires_seconds.seconds.from_now,
        secure: !(Rails.env.test? || Rails.env.development?),
        httponly: !(Rails.env.test? || Rails.env.development?)
      }
    end
  end

  def after_two_factor_success_path_for(_resource)
    stored_location_for(resource_name) || :root
  end

  def after_two_factor_fail_for(resource)
    siem_log_mfa_failure(resource)
    resource.second_factor_attempts_count += 1
    resource.save

    flash.delete(:notice)
    set_flash_message :alert, :attempt_failed, now: true

    if resource.max_login_attempts?
      resource.invalidate_current_otp!
      set_flash_message :alert, :max_login_attempts_reached, now: true
    end

    render :show
  end

  def authenticate_scope!
    self.resource = send(:"current_#{resource_name}")
  end

  def prepare_and_validate
    redirect_to(:root) if resource.nil?
  end
end
