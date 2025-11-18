# frozen_string_literal: true

module Lti
  class JwksController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def index
      jwks_data = Lti::GenerateJwks.call!
      render json: jwks_data
    rescue StandardError => e
      render json: { error: e.message }, status: :internal_server_error
    end
  end
end
