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
      @user.is?(:superadmin) || @user.has_permission?(:communications, :view, project_id: project_id)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :manage, project_id: project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :manage, project_id: project_id)
    end

    def new_form?
      true
    end

    def download_history?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :view, project_id: project_id)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)

        is_client_admin_user = @user.is?(:client_admin)
        clients = is_client_admin_user ? @user.client_admin_clients : @user.project_admin_clients
        permitted_clients = clients.select do |client|
          @user.has_permission?(:communications, :view, project_id: client.id)
        end

        permitted_owner_ids = is_client_admin_user ? permitted_clients.pluck(:id) : permitted_clients.pluck(:tte_id)
        scope.where(owner_id: permitted_owner_ids.uniq)
      end
    end
  end
end
