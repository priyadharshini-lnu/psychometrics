# frozen_string_literal: true

class BaseController < ActionController::Base
  include Pundit
  include SetLocale

  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  prepend_before_action :authenticate_user!
  before_action :detect_mobile
  before_action :set_raven_context

  rescue_from Rack::Timeout::RequestTimeoutException, with: :timeout
  rescue_from ActionController::InvalidAuthenticityToken, with: :handle_invalid_authenticity_token

  private

  def detect_mobile
    request.variant = :mobile if browser.device.mobile?
  end

  def timeout
    remove_cookie_for_file_download
    render 'errors/timeout.html.slim', status: :request_timeout
  end

  def remove_cookie_for_file_download
    cookies.delete(:fileDownload)
  end

  def set_raven_context
    Raven.user_context(id: current_user&.id) # or anything else in session
    Raven.extra_context(params: params.to_unsafe_h, url: request.url)
  end

  def handle_invalid_authenticity_token
    respond_to do |f|
      f.html do
        flash[:notice] = t('errors.try_again')
        redirect_back(fallback_location: root_path)
      end
      f.js { render(:error, locals: { message: t('errors.invalid_token') }) }
    end
  end
end
