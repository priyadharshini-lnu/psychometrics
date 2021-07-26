# frozen_string_literal: true

module Administration
  class CommunicationPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def show?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :view)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :manage, project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permision?(:communications, :manage, project_id)
    end

    def new_form?
      true
    end

    def download_history?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :view, project_id)
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
