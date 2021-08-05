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
      @user.is?(:superadmin) || @user.has_permission?(:communications, :view, project_id)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :manage, project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(:communications, :manage, project_id)
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

        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

        permitted_owner_ids = owner_ids.uniq.select do |owner_id|
          @user.has_permission?(:communications, :view, owner_id)
        end

        scope.where(owner_id: permitted_owner_ids)
      end
    end
  end
end
