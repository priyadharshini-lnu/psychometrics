class BaseController < ActionController::Base
  include Pundit
  include Authenticate
  include SetLocale

  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  prepend_before_action :authenticate_user!
  before_action :detect_mobile

  rescue_from Rack::Timeout::RequestTimeoutException, with: :timeout

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
end
