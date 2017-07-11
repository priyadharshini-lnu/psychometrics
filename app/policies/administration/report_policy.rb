module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:reports, :view)
    end

    # Can open builder of Report (Reports, Modules and etc.)
    # true if it's not Mindmill report
    #   and user is Superadmin or user has grants
    def show?
      !@record.mindmill? &&
        (super || @user.has_grant?(:reports, :manage))
    end

    def create?
      super || @user.has_grant?(:reports, :manage)
    end

    def edit?
      super || @user.has_grant?(:reports, :manage)
    end

    # Can open Websocket Channel for build Report (Reports, Modules and etc.)
    # true if it's not Mindmill report and user is Superadmin
    def open_channel?
      !@record.mindmill? && @user.is?(:superadmin)
    end

    # Can preview Report
    # true if it's not Mindmill report and user is Superadmin
    def preview?
      return false if @record.mindmill?
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
        return scope.none unless @user.has_grant?(:reports, :view)
        scope.
            enabled.
            available_to_view.
            where(owner_id: @user.admin_clients.select('tte_id').distinct)
      end
    end
  end
end
