class Administration::NormPolicy < Administration::BasePolicy
  def copy?
    @user.can?(:superadmin)
  end

  def toggle_status?
    @user.can?(:superadmin)
  end
end
