# frozen_string_literal: true

module Administration
  class UserAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def update_norm?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def update_additional_time?
      (@user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)) &&
        %w[completed timed_out].include?(record&.real_status) &&
        record&.users_result&.expired?
    end

    def rescore_response?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def reset?
      (@user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)) &&
        !record&.users_result&.not_started? &&
        !record&.assessment&.external?
    end

    def allow_edit?
      !record&.assessment&.external? && !record.timed? && record.completed? &&
        (@user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users))
    end
  end
end
