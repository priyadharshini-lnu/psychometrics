# frozen_string_literal: true

module Api::V2::Administration::Concerns::ApiController
  extend ActiveSupport::Concern

  included do
    prepend_before_action :authenticate, unless: -> { try(:skip_authentication?) }
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
    rescue_from Api::Errors::ApiError, with: :render_error
  end

  def authenticate
    if ::ActionController::HttpAuthentication::Basic.has_basic_credentials?(request)
      api_key = fetch_api_key
      @current_user = api_key&.user
      set_request_interface
      raise  Api::Errors::InvalidAuthentication  if api_key.nil? || @current_user.nil?
      raise  Api::Errors::InvalidAuthentication, 'API User is disabled' if @current_user.disabled?
    else
      authenticate_user!
    end
  end

  def fetch_api_key
    authenticate_with_http_basic do |key, token|
      possible_api_key = ApiKey.active.find_by(key: key)
      return nil if possible_api_key.nil? || possible_api_key.token != token

      possible_api_key
    end
  end

  def user_not_authorized
    audit! :user_not_authorized, current_user, payload: params, outcome: :failed,
    failure_reason: :user_not_authorized
    head :forbidden
  end

  def render_error(e)
    error = {
      code: e.code,
      title: e.message,
      status: e.status
    }
    error = error.merge(detail: e.more_info) if e.more_info
    error = error.merge(meta: e.meta) if e.meta
    render json: { errors: [error] }, status: e.status
  end

  def set_request_interface
    request.env['interface'] = 'api'
  end
end
