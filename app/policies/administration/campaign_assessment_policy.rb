# frozen_string_literal: true

module Administration
  class CampaignAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Assessments::CommonPolicy

    def update?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :reset_responses, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_norm?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_mettl_schedule?
      has_permission?(:project_settings, :manage_users, project_id: project_id) && @record.mettl?
    end

    def normalize_factor_scores?
      has_permission?(:results, :normalize_factor_scores) && (
        @record.is_a?(CampaignAssessment) && @record&.normalize_factor_scores?
      )
    end

    def update_assessor_form?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_available_locales?
      update?
    end

    def can_configure_universal_links?
      !@record.external? && @user.is?(:superadmin)
    end

    def enable_universal_link?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_positions?
      has_permission?(:campaigns, :manage)
    end

    def update_external_config?
      @record.iiht? && @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_content_variation?
      @record.simulation? && @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_prework?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update_workshop_activity?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_require_scheduling?
      has_permission?(:campaigns, :manage_users)
    end

    def export_occupations?
      has_permission?(:results, :export_occupations) && @record.dimension&.occupations_enabled?
    end

    def toggle_auto_assign?
      has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end
  end
end
