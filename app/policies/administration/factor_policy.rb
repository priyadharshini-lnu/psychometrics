class Administration::FactorPolicy < Administration::BasePolicy
  def toggle_status?
    @user.can?(:superadmin)
  end

  def copy?
    @user.can?(:superadmin)
  end
end
