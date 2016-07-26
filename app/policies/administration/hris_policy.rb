class Administration::HrisPolicy < Administration::BasePolicy
  def import?
    @user.is?(:superadmin, :admin, :manager)
  end
end
