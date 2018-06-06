module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def export_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :export)
    end

    def export_hogan_results?
      export_results?
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end
  end
end
