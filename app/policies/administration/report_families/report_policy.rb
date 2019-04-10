module Administration
  module ReportFamilies
    class ReportPolicy < Administration::ReportPolicy
      def create?
        @user.is?(:superadmin)
      end

      class Scope < Scope
        def resolve
          return scope if @user.is?(:superadmin)
          scope.none
        end
      end
    end
  end
end
