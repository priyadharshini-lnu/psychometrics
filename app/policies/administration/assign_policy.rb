module Administration
  class AssignPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end
  end
end
