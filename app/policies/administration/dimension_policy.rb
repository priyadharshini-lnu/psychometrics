class Administration::DimensionPolicy < Administration::BasePolicy
  def copy?
    @user.can?(:admin, :superadmin)
  end

  def toggle_status?
    @user.can?(:admin, :superadmin)
  end
end
