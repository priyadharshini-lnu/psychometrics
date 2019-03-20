module Users
  class AuthenticateUser < Rectify::Command
    SPOOF_KEY = :spoof_token
    SSO_KEY = :sso_token
    REDIRECT_KEY = :return_url

    def initialize(params)
      @params = params
    end

    def call
      # Tries auth by spoof token
      if params[SPOOF_KEY]
        authenticate_by_spoof
        return broadcast :invalid_spoof_token unless user
      end

      # Tries auth by SSO token
      if params[SSO_KEY]
        authenticate_by_sso
        return broadcast(:invalid_sso_token, invalid_sso_redirect_url) unless user
      end

      # Exit if no params with token
      return broadcast :not_authenticated unless user

      broadcast(:ok, user)
    end

    private

    attr_reader :params, :user

    # Tries auth by spoof token
    #
    def authenticate_by_spoof
      @user = User.find_by(spoof_token: params[SPOOF_KEY])
      # Remove temporary spoof token from user
      user.update_column(:spoof_token, nil) if user
    end

    # Tries auth by SSO token
    #
    def authenticate_by_sso
      possible_user = Users::Regular.find_by(id: params[:user_id])
      possible_sso_token = Redis.current.get(possible_user&.sso_key)

      @user = possible_user if possible_sso_token == params[SSO_KEY]
    end

    # Builds an url for redirection with status
    #
    def invalid_sso_redirect_url
      return if params[REDIRECT_KEY].blank?

      uri = URI.parse params[REDIRECT_KEY]
      uri.query = uri.query.gsub('ASSESSMENT_STATUS', 'invalid_token') unless uri.query.nil?
      uri.to_s
    end
  end
end
