module Administration
  class OccupationPolicy < Administration::BasePolicy
    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        scope.joins(:dimension).where(dimensions: { owner_id: @user.admin_client_ids })
      end
    end
  end
end
