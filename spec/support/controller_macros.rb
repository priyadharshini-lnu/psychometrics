# frozen_string_literal: true

module ControllerMacros
  def login_user(user)
    set_host(user)
    sign_in(user)
  end

  private

  def set_host(user)
    if self.class.metadata[:type] == :request
      host!('localhost')
    elsif user.respond_to?(:project) && user.project
      request.host = "#{user.project.subdomain}.localhost"
    end
  end
end
