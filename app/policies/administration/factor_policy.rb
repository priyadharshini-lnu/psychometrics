# frozen_string_literal: true

module Administration
  class FactorPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:dimensions, :view)
    end

    def create?
      super || @user.has_grant?(:dimensions, :manage)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)

        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients.
          select('tte_id').distinct
        scope.joins(:dimension).where(dimensions: { owner_id: owner_ids })
      end
    end
  end
end
