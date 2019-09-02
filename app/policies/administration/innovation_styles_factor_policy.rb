module Administration
  class InnovationStylesFactorPolicy < Administration::BasePolicy
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
