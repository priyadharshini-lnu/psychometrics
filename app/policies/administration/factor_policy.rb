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
        scope.joins(:dimension).where(dimensions: { owner_id: @user.admin_clients.select('tte_id').distinct })
      end
    end
  end
end
