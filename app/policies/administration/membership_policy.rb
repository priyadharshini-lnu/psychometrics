module Administration
  class MembershipPolicy < Administration::UserPolicy
    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope.where(client_id: @user.client_ids)
      end
    end
  end
end
