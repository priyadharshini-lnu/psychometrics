# frozen_string_literal: true

module Administration
  class FactorPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:dimensions, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
    end

    def update?
      @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
    end

    class Scope < Scope
      def resolve
        scope = super.with_attached_icon
        return scope if @user.is?(:superadmin)

        owner_ids =
          if @user.is?(:client_admin)
            @user.client_admin_client_ids
          else
            @user.project_admin_clients.select('tte_id').distinct
          end
        scope.joins(:dimension).where(dimensions: { owner_id: owner_ids })
      end
    end
  end
end
