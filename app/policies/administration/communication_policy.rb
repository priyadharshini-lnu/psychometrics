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

        client_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids
        permitted_client_ids = client_ids.select do |client_id|
          @user.has_permission?(:communications, :view, project_id: client_id)
        end

        scope.where('client_id IN (:ids) or project_id IN (:ids)', ids: permitted_client_ids)
      end
    end
  end
end
