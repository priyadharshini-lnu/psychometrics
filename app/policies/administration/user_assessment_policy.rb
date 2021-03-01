# frozen_string_literal: true

module Administration
  class UserAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def update_norm?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    def update_additional_time?
      (@user.is?(:superadmin) || @user.has_grant?(:assessments, :view)) &&
        %w[completed timed_out].include?(record&.real_status) &&
        record&.users_result&.expired?
    end

    def rescore_response?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    def reset?
      (@user.is?(:superadmin) || @user.has_grant?(:assessments, :view)) &&
        !record&.users_result&.not_started? &&
        !record&.assessment&.external?
    end
  end
end
