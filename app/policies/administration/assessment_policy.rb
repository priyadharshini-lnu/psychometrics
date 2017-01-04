module Administration
  class AssessmentPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def update?
      @user.is?(:superadmin, :admin)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def preview?
      @user.is?(:superadmin)
    end

    def reports?
      @user.is?(:superadmin)
    end

    def assign?
      @user.is?(:superadmin)
    end

    def view_report?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.psychometric?
      return true if @user.is?(:manager) && !@record.psychometric?
      false
    end

    def client_index?
      @user.is?(:superadmin, :admin)
    end

    def export_results?
      @user.is?(:superadmin)
    end

    def import_results?
      @user.is?(:superadmin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        scope.where(owner_id: [@user.client_ids])
      end
    end
  end
end
