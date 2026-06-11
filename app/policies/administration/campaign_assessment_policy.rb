# frozen_string_literal: true

module Administration
  class CampaignAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Assessments::CommonPolicy

    def update?
      can_manage_campaign_and_users?
    end

    def destroy?
      has_permission?(:campaigns, :manage)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :reset_responses, project_id: project_id, campaign_id: campaign_id
      )
    end

    def import_external_scoring_results?
      @record.assessment.yoodli? && (@user.is?(:superadmin) || @user.has_permission?(
        :results, :import_external_scoring, project_id: project_id, campaign_id: campaign_id
      ))
    end

    def update_norm?
      can_manage_campaign_and_users?
    end

    def update_mettl_schedule?
      @record.mettl? && can_manage_campaign_and_users?
    end

    def normalize_factor_scores?
      has_permission?(
        :results,
        :normalize_factor_scores
      ) && @record.is_a?(CampaignAssessment) && @record&.normalize_factor_scores?
    end

    def update_assessor_form?
      can_manage_campaign_and_users?
    end

    def update_available_locales?
      can_manage_campaign_and_users?
    end

    def can_configure_universal_links?
      !@record.external? && @user.is?(:superadmin)
    end

    def enable_universal_link?
      @user.is?(:superadmin) || can_manage_campaign_and_users?
    end

    def update_positions?
      has_permission?(:campaigns, :manage)
    end

    def update_external_config?
      @record.iiht? && can_manage_campaign_and_users?
    end

    def update_content_variation?
      @record.simulation? && can_manage_campaign_and_users?
    end

    def update_pearson_variation?
      @record.pearson? && can_manage_campaign_and_users?
    end

    def update_mhs_confidence_interval?
      @record.mhs? && can_manage_campaign_and_users?
    end

    def update_mhs_leadership_bar?
      @record.mhs? && can_manage_campaign_and_users?
    end

    def update_mhs_norm_region?
      @record.mhs? && can_manage_campaign_and_users?
    end

    def update_mhs_norm_option?
      @record.mhs? && can_manage_campaign_and_users?
    end

    def update_prework?
      can_manage_campaign_and_users?
    end

    def update_workshop_activity?
      can_manage_campaign_and_users?
    end

    def toggle_require_scheduling?
      can_manage_campaign_and_users?
    end

    def export_occupations?
      !!(has_permission?(:results, :export_occupations) && @record.dimension&.occupations_enabled?)
    end

    def bulk_export_raw_factor_scores?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :scores, project_id: project_id, campaign_id: campaign_id
      )
    end

    def bulk_export_norm_factor_scores?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :scores, project_id: project_id, campaign_id: campaign_id
      )
    end

    def toggle_auto_assign?
      can_manage_campaign_and_users?
    end

    def toggle_caching?
      has_permission?(:campaigns, :manage)
    end

    def update_proctoring_settings?
      can_manage_campaign_and_users?
    end
  end
end
