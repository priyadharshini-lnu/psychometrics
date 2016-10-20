class Managers::BaseController < ApplicationController
  # Authorisation flow
  #
  include Pundit
  ## Prepend :administration namespace to policy
  include Managers::Policies

  # Ensuring policies and scopes are used
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index
  before_action :authenticate

  # Custom layout for manager panel
  layout 'users'

  protect_from_forgery with: :exception

  add_flash_types :notice, :error, :success

  private

  def authenticate
    return if Rails.env.development?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
