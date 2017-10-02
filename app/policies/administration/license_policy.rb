module Administration
  class LicensePolicy < Administration::BasePolicy
    def show?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end
  end
end
