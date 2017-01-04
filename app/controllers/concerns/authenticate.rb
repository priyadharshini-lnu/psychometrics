module Authenticate
  extend ActiveSupport::Concern

  included do
    prepend_before_action :authenticate
  end

  private

  def authenticate
    return if Rails.env.development? || Rails.env.test?
    authenticate_or_request_with_http_basic do |username, password|
      username == 'staging' && password == 'sumatosoft'
    end
  end
end
