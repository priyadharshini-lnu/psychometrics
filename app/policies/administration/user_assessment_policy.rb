# frozen_string_literal: true

module Administration
  class UserAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Assessments::CommonPolicy

    def index?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def push_webhook?
      !record.assessment.external? && @user.has_permission?(:project_settings, :webhooks, project_id: project_id)
    end

    def webhook_payload?
      has_permission?(:project_settings, :webhooks, project_id: project_id)
    end

    def destroy?
      @user.is?(:superadmin)
    end

    def update_norm?
      (@user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )) && (!record.assessment.pearson? || record.not_started?)
    end

    def update_mettl_schedule?
      has_permission?(:project_settings, :manage_users,
                      project_id: project_id) && record.assessment.mettl? && record.not_started?
    end

    def update_content_variation?
      has_permission?(:project_settings, :manage_users,
                      project_id: project_id) && record.assessment.simulation? && record.not_started?
    end

    def update_additional_time?
      !record&.assessment&.external? &&
        (@user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )) && %w[completed timed_out].include?(record&.real_status) &&
        record&.expired?
    end

    def rescore_response?
      has_permission?(:results, :rescore_responses)
    end

    def toggle_require_scheduling?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def reset?
      assessment = record.assessment
      has_permission_to_reset_assessment? &&
        (assessment.common? ||
          assessment.saville? ||
          assessment.simulation? ||
          (assessment.mettl? && record.reset_count < UserAssessment::MAX_RESET_COUNT && record.completed?) ||
           (assessment.iiht? && record.completed?))
    end

    def reset_progress?
      !record.assessment.external? && !record.assessment.agile? && !record.not_started? &&
        (@user.is?(:superadmin) || has_permission?(:results, :reset_progress))
    end

    private

    def has_permission_to_reset_assessment?
      @user.has_permission?(
        :results, :reset_responses, project_id: project_id, campaign_id: campaign_id
      )
    end
  end
end
