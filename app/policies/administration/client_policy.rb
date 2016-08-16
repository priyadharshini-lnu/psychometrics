class Administration::ClientPolicy < Administration::BasePolicy
  def license?
    update?
  end

  def scope
    Pundit.policy_scope!(user, record.class)
  end

  class Scope < Administration::BasePolicy::Scope
    def resolve
      return scope if @user.superadmin?
      scope.where(id: @user.client_ids)
    end
  end
end
