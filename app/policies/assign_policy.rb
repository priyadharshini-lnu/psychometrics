class AssignPolicy < Administration::BasePolicy
  # TODO: move to another scope
  def update?
    @user.is?(:superadmin)
  end
end
