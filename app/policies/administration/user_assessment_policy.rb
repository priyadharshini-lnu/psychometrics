# frozen_string_literal: true

module Administration
  class UserAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def update_norm?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end
  end
end
