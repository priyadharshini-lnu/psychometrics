class Administration::DimensionPolicy < Administration::BasePolicy
  def initialize(user, record)
    @user   = user
    @record = record
  end

  def index?
    @user.can?(:admin)
  end

  def destroy?
    @user.can?(:admin)
  end

  def new?
    @user.can?(:admin)
  end

  def create?
    @user.can?(:admin)
  end

  def edit?
    @user.can?(:admin)
  end

  def update?
    @user.can?(:admin)
  end
end
