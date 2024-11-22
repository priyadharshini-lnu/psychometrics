# frozen_string_literal: true

module AuthenticateByLighthouseJwt
  extend ActiveSupport::Concern

  private

  def authenticate_by_lighthouse_jwt!
    user, token_expired = JwtAuthenticator.get_user_by_lighthouse_jwt(params['jwt'], @current_project)

    unless user
      audit!(:single_sign_on, nil, record_type: 'User', payload: params.except('jwt'), outcome: 'failed',
             failure_reason: :invalid_jwt_token)
      return redirect_to(new_user_session_path)
    end

    @current_user = user
    sign_in(user) unless token_expired
  end
end
