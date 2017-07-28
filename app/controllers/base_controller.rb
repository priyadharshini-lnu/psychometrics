class BaseController < ActionController::Base
  include Pundit
  include Authenticate
  include SetLocale

  protect_from_forgery with: :exception
  add_flash_types :notice, :error, :success

  prepend_before_action :authenticate_user!
  before_action :detect_mobile

  private

  def detect_mobile
    request.variant = :mobile if browser.device.mobile?
  end
end
