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
      # TODO: First need release membering
      scope#.where(id: @user.client.try(:id))
    end
  end
end
