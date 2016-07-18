class Administration::DimensionPolicy < Administration::BasePolicy
  def initialize(user, record)
    @user   = user
    @record = record
  end

  def index?
    @user.can?(:admin, :superadmin)
    # false
  end

  def destroy?
    @user.can?(:admin, :superadmin)
  end

  def new?
    @user.can?(:admin, :superadmin)
  end

  def create?
    new?
  end

  def edit?
    @user.can?(:admin, :superadmin)
  end

  def update?
    edit?
  end

  def copy?
    @user.can?(:admin, :superadmin)
  end

  def toggle_status?
    @user.can?(:admin, :superadmin)
  end

  def sidebar?
    @user.can?(:admin, :superadmin)
  end
end
