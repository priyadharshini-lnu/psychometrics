module Administration
  class ClientPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:clients, :view)
    end

    def create?
      super || @user.has_grant?(:clients, :manage)
    end

    def projects?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def sub_campaigns?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def show?
      true
    end

    def design?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :design)
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin)
        parent_ids = @user.admin_clients.not_retails.enabled.pluck(:id)
        scope.where.has { (id.in parent_ids) | (parent_id.in parent_ids) }
      end
    end
  end
end
