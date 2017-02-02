module Administration
  module Assessments
    class ClientPolicy < Administration::ClientPolicy
      class Scope < Scope
        def resolve
          return scope.tenancies if @user.is?(:superadmin)
          super
        end
      end
    end
  end
end
