require './spec/features/helpers/assessments'
require './spec/features/helpers/clients'
require './spec/features/helpers/norms'
require './spec/features/helpers/reports'
require './spec/features/helpers/users'

module Features
  module Helpers
    def reload_context
      DatabaseCleaner.clean
      before_context
    end

    def before_context
      # overwrite in feature
    end

    def wait_for_ajax
      Timeout.timeout(Capybara.default_max_wait_time) do
        loop until finished_all_ajax_requests?
      end
    end

    def finished_all_ajax_requests?
      page.evaluate_script('jQuery.active').zero?
    end

    # For now is used only for superadmin
    def enter_as(role_name, options = {})
      grants = options[:grants] || {}
      @current_user = case role_name
                        when :superadmin
                          create(:superadmin)
                        when :admin
                          create(:client_admin, grants: grants)
                        when :manager
                          create(:manager)
                        else
                          create(:user)
                      end
      @current_membership = current_user.memberships.try(:last)
      login_as(current_user)
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
  end
end
