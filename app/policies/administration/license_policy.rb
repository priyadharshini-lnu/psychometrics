module Administration
  class LicensePolicy < Administration::BasePolicy
    def show?
      @user.is?(:superadmin, :admin)
    end
  end
end
