# frozen_string_literal: true

module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    include ::Administration::Assessments::CommonPolicy

    def index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def export_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :export)
    end

    def select_raw_export_type?
      export_results?
    end

    def export_normed_results?
      @user.is?(:superadmin)
    end

    def export_hogan_results?
      export_results?
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    def generate_universal_link?
      @user.is?(:superadmin)
    end

    def download_qrcode?
      @user.admin?
    end
  end
end
