# frozen_string_literal: true

module Administration
  class ReportFamilyPolicy < ReportPolicy
    def create?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin)

        if @user.has_grant?(:reports, :view)
          scope.where(id: @user.ttes.joins(:available_reports).pluck('report_families.id'))
        else
          scope.none
        end
      end
    end
  end
end
