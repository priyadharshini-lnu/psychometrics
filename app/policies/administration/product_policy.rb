module Administration
  class ProductPolicy < Administration::BasePolicy
    def sidebar?
      @user.is?(:superadmin)
    end
  end
end
