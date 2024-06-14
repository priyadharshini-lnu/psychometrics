# frozen_string_literal: true

module Users
  class AuthenticateUser < Rectify::Command
    SPOOF_KEY = :spoof_token
    SSO_KEY = :sso_token
    JWT_KEY = :jwt
    REDIRECT_KEY = :return_url

    def initialize(params)
      @params = params
    end

    def call
      # Tries auth by spoof token
      if params[SPOOF_KEY]
        authenticate_by_spoof
        return broadcast :invalid_spoof_token unless user

        found_by = :spoof
      end

      # Tries auth by SSO token
      if params[SSO_KEY]
        request.env[:sso] = 'true'
        authenticate_by_sso

        unless user
          audit!(:single_sign_on, nil, record_type: 'User', payload: params.except('sso_token'), outcome: 'failed',
          failure_reason: :invalid_sso_token)
          return broadcast(:invalid_sso_token, invalid_redirect_url)
        end

        audit! :single_sign_on, user, user: user, payload: params.except('sso_token'), outcome: 'successful'
        found_by = :sso
      end

      if params[JWT_KEY]
        request.env[:sso] = 'true'
        authenticate_by_jwt

        unless user
          audit!(:single_sign_on, nil, record_type: 'User', payload: params.except('jwt'), outcome: 'failed',
          failure_reason: :invalid_jwt_token)
          return broadcast(:invalid_jwt_token, invalid_redirect_url)
        end

        audit! :single_sign_on, user, user: user, payload: params.except('jwt'), outcome: 'successful'
        found_by = :jwt
      end

      # Exit if no params with token
      return broadcast :not_authenticated unless user

      broadcast(:ok, user, found_by)
    end

    private

    attr_reader :params, :user

    # Tries auth by spoof token
    #
    def authenticate_by_spoof
      @user = User.find_by(spoof_token: params[SPOOF_KEY])
      # Remove temporary spoof token from user
      user&.update_column(:spoof_token, nil)
    end

    # Tries auth by SSO token
    #
    def authenticate_by_sso
      possible_user = Users::Regular.find_by(id: params[:user_id])
      possible_sso_token = $redis.get(possible_user&.sso_key)

      @user = possible_user if possible_sso_token == params[SSO_KEY]
    end

    # Tries auth by JWT token
    #
    def authenticate_by_jwt
      @user = JwtAuthenticator.authenticate(params[JWT_KEY])
    end

    # Builds an url for redirection with status
    #
    def invalid_redirect_url
      return if params[REDIRECT_KEY].blank?

      uri = URI.parse params[REDIRECT_KEY]
      uri.query = uri.query.gsub('ASSESSMENT_STATUS', 'invalid_token') if uri.query
      uri.path = uri.path.gsub('ASSESSMENT_STATUS', 'invalid_token') if uri.path
      uri.fragment = uri.fragment.gsub('ASSESSMENT_STATUS', 'invalid_token') if uri.fragment
      uri.to_s
    end
  end
end
