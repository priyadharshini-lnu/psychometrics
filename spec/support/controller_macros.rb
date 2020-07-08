# frozen_string_literal: true

module ControllerMacros
  def login_as(role: nil, user: nil)
    if role
      user = create_user_of_role(role)
      sing_in_user(user)
    elsif user
      sing_in_user(user)
    end
  end

  private

  def sing_in_user(user)
    request.host = "#{user.project.subdomain}.lvh.me" if user.project
    sign_in(user)
  end

  def create_user_of_role(role)
    case role
      when :superadmin
        create(:superadmin)
      when :admin
        create(:client_admin)
      when :manager
        create(:manager)
      when :regular
        create(:user, :with_project_membershi)
    end
  end
end
