module Administration
  class ClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def show?
      scope.where(id: record.id).exists?
    end

    def update?
      @user.is?(:superadmin, :admin)
    end

    def edit?
      update?
    end

    def license?
      @user.is?(:superadmin)
    end

    def design?
      @user.is?(:superadmin)
    end

    def scope
      Pundit.policy_scope!(user, record.class)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope.enterprise.enabled.where(id: @user.client_ids)
      end
    end
  end
end
