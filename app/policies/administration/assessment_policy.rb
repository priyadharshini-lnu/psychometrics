module Administration
  class AssessmentPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:assessments, :view)
    end

    def show?
      super || @user.has_grant?(:assessments, :manage)
    end

    def create?
      super || @user.has_grant?(:assessments, :manage)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def preview?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    def reports?
      @user.is?(:superadmin)
    end

    def assign?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def view_report?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.psychometric? && @user.has_grant?(:assigns, :view)
      return true if @user.is?(:manager) && !@record.psychometric?
      false
    end

    def client_index?
      @user.is?(:superadmin, :admin)
    end

    def export_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :export)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:assessments, :view)
          admin_client_ids = @user.admin_client_ids
          arr_id = AssignClient.where(client_id: admin_client_ids).distinct.pluck(:assessment_id)
          Assessment.where.has { (owner_id.in admin_client_ids) | (id.in arr_id) }
        else
          scope.none
        end
      end
    end
  end
end
