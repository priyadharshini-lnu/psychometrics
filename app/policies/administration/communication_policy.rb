module Administration
  class CommunicationPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:communications, :view)
    end

    def create?
      super || @user.has_grant?(:communications, :manage)
    end

    def show?
      super || @user.has_grant?(:communications, :view)
    end

    def new_form?
      true
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:communications, :view)
          owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids
          scope.where(owner_id: owner_ids)
        else
          scope.none
        end
      end
    end
  end
end
