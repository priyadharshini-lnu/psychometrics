# frozen_string_literal: true

module OracleAnalytics
  class GetEmbedToken < BaseCommand
    private_attr_reader :current_user

    def initialize(current_user)
      @current_user = current_user
    end

    def call
      conn = Faraday.new(url: config[:base_api_url]) do |faraday|
        faraday.request :url_encoded
        faraday.adapter Faraday.default_adapter
        faraday.request :authorization, :basic, authorization_token
        faraday.request :url_encoded
      end
      response = conn.post('/oauth2/v1/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: user_assertion_jwt,
        scope: config[:oauth_scope_for_embedding]
      })
      response_body = JSON.parse(response.body)
      if response.status != 200
        Rails.logger.error("Failed to generate OAC embed token. Error: #{response.body}")
        return broadcast :error, response_body
      end

      broadcast :ok, response_body['access_token']
    end

    private

    def authorization_token
      token = "#{secrets[:client_id]}:#{secrets[:client_secret]}"
      Base64.strict_encode64(token)
    end

    def user_assertion_jwt
      JWT.encode(jwt_payload, private_key, 'RS256', jwt_headers)
    end

    def jwt_headers
      {
        alg: 'RS256',
        typ: 'JWT',
        kid: 'RSACert'
      }
    end

    def jwt_payload
      {
        exp: 8.hours.from_now.to_i,
        sub: idcs_user_email,
        aud: 'https://identity.oraclecloud.com/',
        iss: secrets[:client_id],
        'oracle.oauth.sub.id_type': 'LDAP_UID',
        prn: idcs_user_email,
        jti: secrets[:client_id],
        iat: Time.now.to_i,
        'oracle.oauth.prn.id_type': 'LDAP_UID'
      }
    end

    def idcs_user_email
      current_user.is?(:superadmin) ? config[:all_workbook_access_user_email] : current_user.email
    end

    def private_key
      OpenSSL::PKey::RSA.new(ENV.fetch('OAC_PRIVATE_KEY', nil))
    end

    def config
      @config ||= Settings.oac
    end

    def secrets
      @secrets ||= Settings.secrets.oac
    end
  end
end
