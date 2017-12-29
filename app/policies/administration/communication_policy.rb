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

    def download_history?
      create?
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        return scope.none unless has_scope?
        @user.is?(:client_admin) ? client_admin_scope(scope) : project_admin_scope(scope)
      end

      private

      def has_scope?
        @user.has_grant?(:communications, :view) && (@user.is?(:client_admin) || @user.is?(:project_admin))
      end

      def client_admin_scope(scope)
        scope.where(owner_id: @user.client_admin_client_ids)
      end

      def project_admin_scope(scope)
        scope.where(project_id: @user.project_admin_client_ids).where.not(owner_id: nil)
      end
    end
  end
end
