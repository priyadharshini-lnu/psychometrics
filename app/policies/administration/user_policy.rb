class Administration::UserPolicy < Administration::BasePolicy
  def index?
    return true if @user.admin?
    super
  end

  def edit?
    return true if @user.superadmin?
    return true if @user.admin?
    @record == @user
  end

  def update?
    return true if @user.superadmin?
    return true if @user.admin?
    @record == @user
  end
end
