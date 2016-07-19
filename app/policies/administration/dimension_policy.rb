class Administration::DimensionPolicy < Administration::BasePolicy
  def initialize(user, record)
    @user   = user
    @record = record
  end

  def copy?
    @user.can?(:admin, :superadmin)
  end

  def toggle_status?
    @user.can?(:admin, :superadmin)
  end
end
