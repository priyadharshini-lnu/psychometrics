def logged_in_as(role_name, options = {})
  grants = options[:grants] || {}
  @current_user = case role_name
                  when :superadmin
                    create(:superadmin)
                  when :admin
                    create(:user, :with_membership_admin, grants: grants)
                  when :manager
                    create(:user, :with_membership_manager)
                  else
                    create(:user, :with_membership_member)
                  end
  @current_membership = @current_user.memberships.try(:last)
  login_as(@current_user)
end

def current_user
  @current_user
end

def current_membership
  @current_membership
end

def set_host_by_client(client)
  port = 31_338
  Capybara.app_host = "http://#{client.subdomain}.lvh.me:#{port}"
end
