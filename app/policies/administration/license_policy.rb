# frozen_string_literal: true

module Administration
  class LicensePolicy < Administration::BasePolicy
    def overview?
      @user.is?(:superadmin) || @user.has_client_grant?(:clients, :view_licenses, @project_id)
    end

    def new?
      @user.is?(:superadmin)
    end

    def edit?
      @user.is?(:superadmin)
    end

    def index?
      super || @user.has_client_grant?(:clients, :view_licenses, @project_id)
    end
  end
end
