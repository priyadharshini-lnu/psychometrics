module Administration
  class LibraryPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:libraries, :view)
    end

    def create?
      super || @user.has_grant?(:libraries, :manage)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:libraries, :view)
          scope.where(owner_id: @user.admin_clients.select('tte_id').distinct)
        else
          scope.none
        end
      end
    end
  end
end
