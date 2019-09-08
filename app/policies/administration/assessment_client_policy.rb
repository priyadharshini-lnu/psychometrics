# frozen_string_literal: true

module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def export_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :export)
    end

    # Don't allow to export Normed Results if Assessment is mindmill
    #
    def export_normed_results?
      @user.is?(:superadmin) && @record.mindmill_id.nil?
    end

    def export_hogan_results?
      export_results?
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end
  end
end
