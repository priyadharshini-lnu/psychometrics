# frozen_string_literal: true

module Administration
  class LibraryPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:libraries, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:libraries, :manage)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_permission?(:libraries, :manage, project_id: project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(:libraries, :manage, project_id: project_id)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    class Scope < Scope
      def resolve
        scope = super.with_attached_file
        return scope if @user.is?(:superadmin)

        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

        permitted_owner_ids = owner_ids.uniq.select do |owner_id|
          @user.has_permission?(:libraries, :view, project_id: owner_id)
        end

        scope.where(owner_id: permitted_owner_ids)
      end
    end
  end
end
