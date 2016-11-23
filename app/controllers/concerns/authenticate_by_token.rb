module AuthenticateByToken
  extend ActiveSupport::Concern

  private

  def authenticate_by_token!
    user_token = params[:user_token].presence
    user       = user_token && User.find_by(authentication_token: user_token.to_s)
    sign_in(user, store: false) if user
    authenticate_user!
  end
end
