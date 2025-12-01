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
        audit_oauth2_token_failure(form, result[:error])
        render json: result[:error], status: :bad_request
      elsif result[:ok]
        audit_oauth2_token_success(form, result[:ok])
        render json: result[:ok], status: :ok
      end
    rescue StandardError => e
      audit_oauth2_token_error(e.message)
      render json: { error: 'server_error', error_description: e.message }, status: :internal_server_error
    end

    private

    def oauth2_token_params
      params.permit(:grant_type, :client_assertion_type, :client_assertion, :scope)
    end

    def audit_oauth2_token_failure(form, error)
      AuditLogModule.audit!(:lti_oauth2_token_failure, nil,
                            payload: {
                              error: error,
                              grant_type: form.grant_type,
                              scope: form.scope
                            })
    end

    def audit_oauth2_token_success(form, result)
      AuditLogModule.audit!(:lti_oauth2_token_success, nil,
                            payload: {
                              grant_type: form.grant_type,
                              scope: form.scope,
                              token_type: result[:token_type]
                            })
    end

    def audit_oauth2_token_error(error_message)
      AuditLogModule.audit!(:lti_oauth2_token_error, nil,
                            payload: {
                              error: 'server_error',
                              error_description: error_message
                            })
    end
  end
end
