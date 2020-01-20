# frozen_string_literal: true

module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    def generate_universal_link?
      @user.is?(:superadmin)
    end
  end
end
