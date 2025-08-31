# frozen_string_literal: true

module ControllerMacros
  def login_user(user)
    request.host = "#{user.project.subdomain}.localhost" if user.project
    sign_in(user)
  end
end
