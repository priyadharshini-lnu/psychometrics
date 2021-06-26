# frozen_string_literal: true

module Administration
  class UserAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def destroy?
      @user.is?(:superadmin) || !record.completed? && @user.has_grant?(:campaigns, :manage_users)
    end

    def update_norm?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def update_additional_time?
      !record&.assessment&.external? &&
        (@user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)) &&
        %w[completed timed_out].include?(record&.real_status) &&
        record&.users_result&.expired?
    end

    def rescore_response?
      !record&.assessment&.external? &&
        @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def reset?
      !record&.assessment&.mindmill? && !record&.assessment&.hogan? &&
        (@user.is?(:superadmin) || @user.has_grant?(:results, :reset_responses))
    end

    def allow_edit?
      !record.assessment.external? && !record.assessment.agile? && !record.timed? && record.completed? &&
        (@user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users))
    end
  end
end
