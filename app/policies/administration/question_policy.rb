module Administration
  class QuestionPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:questions, :view)
    end

    def create?
      super || @user.has_grant?(:questions, :manage)
    end

    def configure?
      update?
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def new_assign?
      @user.is?(:superadmin)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:questions, :view)
          owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients.select('tte_id').distinct
          scope.where(owner_id: owner_ids)
        else
          scope.none
        end
      end
    end
  end
end
