module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def export_results?
      @user.is?(:superadmin)
    end

    def import_results?
      @user.is?(:superadmin)
    end
  end
end
