module Administration
  class LicensePolicy < Administration::BasePolicy
    def show?
      super || @user.has_grant?(:clients, :view)
    end
  end
end
