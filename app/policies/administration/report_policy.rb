module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:reports, :view)
    end

    def show?
      super || @user.has_grant?(:reports, :manage)
    end

    def edit?
      result = super
      result ||= @user.has_grant?(:reports, :manage) && @user.tte_own_reports_ids.include?(record.id) unless record.is_a? Class
      result
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def preview?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.assessment.psychometric? && @user.has_grant?(:reports, :view)
      false
    end

    def left_menu?
      index?
    end

    def sidebar?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def toggle_status?
      edit?
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:reports, :view)
          scope
              .enabled
              .available_to_view
              .where('reports.owner_id in (?) or reports.id in (?)',
                     @user.tte_ids,
                     @user.tte_own_reports_ids)
        else
          scope.none
        end
      end
    end
  end
end
