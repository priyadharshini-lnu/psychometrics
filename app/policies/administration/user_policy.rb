class Administration::UserPolicy < Administration::BasePolicy
  def initialize(user, record)
    @user = user
    @record = record
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
