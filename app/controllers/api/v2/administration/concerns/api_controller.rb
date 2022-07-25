# frozen_string_literal: true

module Api::V2::Administration::Concerns::ApiController
  extend ActiveSupport::Concern

  included do
    prepend_before_action :authenticate, unless: -> { try(:skip_authentication?) }
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  end

  def authenticate
    if ::ActionController::HttpAuthentication::Basic.has_basic_credentials?(request)
      @api_key      = fetch_api_key
      @current_user = @api_key&.user
      raise Errors::Api::AuthError unless @api_key
      raise Errors::Api::AuthError, 'API User is disabled' if @current_user&.disabled
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
    head :forbidden
  end
end
