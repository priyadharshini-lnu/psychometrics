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

    def update?
      @user.is?(:superadmin, :admin)
    end

    def preview?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.assessment.psychometric?
      false
    end

    def left_menu?
      @user.is?(:superadmin, :admin)
    end

    def sidebar?
      @user.is?(:superadmin)
    end

    class Scope < Scope
      def resolve
        collection = [scope].flatten.last
        return collection if @user.is?(:superadmin)
        collection.enabled.available_to_view.where(owner_id: [@user.client_ids])
      end
    end
  end
end
