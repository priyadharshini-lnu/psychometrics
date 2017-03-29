module Administration
  class ReportFamilyPolicy < ReportPolicy
    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
        scope.none
      end
    end
  end
end
