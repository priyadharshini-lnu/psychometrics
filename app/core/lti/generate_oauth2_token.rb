# frozen_string_literal: true

module Lti
  class GenerateOauth2Token < BaseCommand
    include SiemLogger::ControllerHelper

    VALID_LTI_SCOPES = [
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/score'
    ].freeze

    attr_reader :form, :request

    def initialize(form, request)
      @form = form
      @request = request
    end

    def call
      return error_response if form.error_response

      project_id = validate_jwt_assertion

      unless project_id
        return broadcast(:error, invalid_client_error)
      end

      broadcast(:ok, generate_access_token_response(project_id))
    end

    private

    def error_response
      form.error_response
    end

    def validate_jwt_assertion
      validate_jwt(form.client_assertion)
    end

    def validate_jwt(client_assertion)
      unverified_payload, = JWT.decode(client_assertion, nil, false)
      project_id = unverified_payload['iss'] || unverified_payload['sub']

      integration = find_integration_by_deployment_or_client_id(unverified_payload, project_id)

      jwt_payload, _jwt_header = JWT.decode(
        client_assertion,
        nil,
        true,
        {
          algorithm: 'RS256',
          verify_iss: true,
          verify_aud: true,
          verify_sub: true,
          verify_expiration: true,
          verify_not_before: true,
          verify_iat: true,
          required_claims: %w[iss sub aud exp iat jti],
          iss: project_id,
          aud: oauth2_token_url(integration),
          algorithms: ['RS256']
        }
      ) { |header, _payload| fetch_jwt_public_key(header['kid'], integration) }

      validate_jwt_claims!(jwt_payload)

      jwt_payload['sub']
    rescue JWT::DecodeError
      false
    end

    def validate_jwt_claims!(payload)
      unless payload['iss'] == payload['sub']
        raise JWT::InvalidIssuerError, 'Invalid issuer or subject - must match'
      end

      unless form.grant_type == 'client_credentials'
        raise JWT::DecodeError, 'Invalid grant_type - must be client_credentials'
      end

      expected_assertion_type = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
      unless form.client_assertion_type == expected_assertion_type
        raise JWT::DecodeError, "Invalid client_assertion_type - must be #{expected_assertion_type}"
      end

      validate_lti_scopes!

      now = Time.current.to_i
      iat = payload['iat'].to_i
      exp = payload['exp'].to_i

      if iat > now + 60 || iat < now - 5.minutes
        raise JWT::InvalidIatError, 'IAT claim too old or in future'
      end

      if exp <= now - 60
        raise JWT::ExpiredSignature, 'Token has expired'
      end
    end

    def fetch_jwt_public_key(kid, integration)
      result = Lti::FetchJwtPublicKey.call(kid, integration)

      if result[:ok]
        result[:ok]
      else
        Rails.logger.error "Failed to fetch JWT public key: #{result[:error]}"
        raise JWT::DecodeError, result[:error]
      end
    end

    def find_integration_by_deployment_or_client_id(payload, project_id)
      deployment_id = payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id']

      if deployment_id.present?
        Integration.find_by(id: deployment_id)
      else
        # TODO: Need to handle multiple LTI tools with in a project
        Integration.active.lti_tools.where(project_id: project_id).first
      end
    end

    def oauth2_token_url(integration)
      project = integration&.project

      Utility::Url.generate(
        :lti_oauth2_token_url,
        subdomain: project.subdomain
      )
    end

    def broadcast(status, data)
      { status => data }
    end

    def validate_lti_scopes!
      return if form.scope.blank?

      requested_scopes = form.scope.split
      invalid_scopes = requested_scopes - VALID_LTI_SCOPES

      if invalid_scopes.any?
        raise JWT::DecodeError, "Invalid scope(s): #{invalid_scopes.join(', ')}"
      end
    end

    def generate_access_token_response(project_id)
      token_result = Lti::Oauth2AccessToken.create_token(
        project_id: project_id,
        scope: form.scope,
        expires_in: 1.hour
      )

      {
        access_token: token_result[:raw_token],
        token_type: token_result[:token_type],
        expires_in: token_result[:expires_in],
        scope: form.scope
      }.tap do
        siem_log_token_issuance(nil, 'LTI',
                                context: "Project: #{project_id}",
                                identity_provider: 'LTI Tool')
      end
    rescue StandardError => e
      Rails.logger.error "Failed to create OAuth2 access token: #{e.message}"
      broadcast(:error, {
        'error' => 'server_error',
        'error_description' => 'Failed to generate access token'
      })
    end

    def invalid_client_error
      {
        'error' => 'invalid_client',
        'error_description' => 'Invalid client assertion'
      }
    end
  end
end
