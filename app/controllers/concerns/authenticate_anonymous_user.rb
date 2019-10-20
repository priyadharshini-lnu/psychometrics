# frozen_string_literal: true

module AuthenticateAnonymousUser
  def authenticate_anonymous_user!
    user = Users::AuthenticateAnonymousUser.call!(cookies)
    @current_user = @anonymous_user = user if user
  end
end
