# frozen_string_literal: true

module Administration
  class CampaignAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def update?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:results, :reset_responses)
    end

    def update_norm?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def update_assessor_form?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def can_configure_universal_links?
      !@record.external? && @user.is?(:superadmin)
    end

    def enable_universal_link?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end

    def attach_to_group?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
    end
  end
end
