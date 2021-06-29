# frozen_string_literal: true

module Administration
  class UserAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def destroy?
      @user.is?(:superadmin) || !record.completed? && @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def update_norm?
      @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def update_additional_time?
      !record&.assessment&.external? &&
        (@user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)) &&
        %w[completed timed_out].include?(record&.real_status) &&
        record&.users_result&.expired?
    end

    def rescore_response?
      !record&.assessment&.external? &&
        @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
    end

    def reset?
      !record&.assessment&.mindmill? && !record&.assessment&.hogan? &&
        (@user.is?(:superadmin) || @user.has_client_grant?(:results, :reset_responses, @project_id))
    end
  end
end
