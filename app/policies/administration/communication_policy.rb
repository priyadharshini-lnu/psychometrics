module Administration
  class CommunicationPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:communications, :view)
    end

    def create?
      super || @user.has_grant?(:communications, :manage)
    end

    def new_form?
      true
    end

    def edit_form?
      true
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:communications, :view)
          scope.where(owner_id: [@user.admin_client_ids])
        else
          scope.none
        end
      end
    end
  end
end
