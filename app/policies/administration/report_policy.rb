module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def preview?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.assessment.psychometric?
      false
    end

    def left_menu?
      @user.is?(:superadmin)
    end

    def sidebar?
      @user.is?(:superadmin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope.enabled.joins(:clients).where(clients: { id: @user.client_ids })
      end
    end
  end
end
