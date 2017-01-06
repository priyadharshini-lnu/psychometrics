module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:reports, :view)
    end

    def show?
      super || @user.has_grant?(:reports, :manage)
    end

    def create?
      super || @user.has_grant?(:reports, :manage)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def preview?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.assessment.psychometric?
      false
    end

    def left_menu?
      index?
    end

    def sidebar?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:reports, :view)
          scope.enabled.available_to_view.where(owner_id: @user.admin_client_ids)
        else
          scope.none
        end
      end
    end
  end
end
