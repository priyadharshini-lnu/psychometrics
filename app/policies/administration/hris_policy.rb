class Administration::HrisPolicy < Administration::BasePolicy
  def import?
    @user.is?(:superadmin, :client_admin, :project_admin, :manager)
  end
end
