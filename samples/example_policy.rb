class Administration::ExamplePolicy < Administration::BasePolicy
  def index?
    @user.is?(:admin, :superadmin)
    # false
  end

  def destroy?
    @user.is?(:admin, :superadmin)
  end

  def new?
    @user.is?(:admin, :superadmin)
  end

  def create?
    new?
  end

  def edit?
    @user.is?(:admin, :superadmin)
  end

  def update?
    edit?
  end
end
