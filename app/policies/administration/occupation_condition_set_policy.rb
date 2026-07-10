# frozen_string_literal: true

module Administration
  class OccupationConditionSetPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:dimensions, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
    end

    def copy?
      create?
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)

        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids
        scope.joins(:dimension).where(dimensions: { owner_id: owner_ids })
      end
    end
  end
end
