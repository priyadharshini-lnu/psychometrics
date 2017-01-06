module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def export_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :export)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end
  end
end
