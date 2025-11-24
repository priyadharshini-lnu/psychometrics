# frozen_string_literal: true

module Lti
  class Oauth2Controller < ActionController::Base
    skip_before_action :verify_authenticity_token

    def show
      head :ok
    end

    def token
      form = Lti::Oauth2TokenForm.new(oauth2_token_params)
      result = Lti::GenerateOauth2Token.new(form, request).call

      if result[:error]
        render json: result[:error], status: :bad_request
      elsif result[:ok]
        render json: result[:ok], status: :ok
      end
    rescue StandardError => e
      render json: { error: 'server_error', error_description: e.message }, status: :internal_server_error
    end

    private

    def oauth2_token_params
      params.permit(:grant_type, :client_assertion_type, :client_assertion, :scope)
    end
  end
end
