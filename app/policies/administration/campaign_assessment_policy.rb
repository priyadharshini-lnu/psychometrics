# frozen_string_literal: true

module Administration
  class CampaignAssessmentPolicy < Administration::BasePolicy
    include ::Administration::Common::AssessmentExportPolicy

    def update?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def destroy?
      update?
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    def rescore_responses?
      update?
    end

    def update_norm?
      update?
    end

    def update_assessor_form?
      update?
    end

    def update_available_locales?
      update?
    end

    def can_configure_universal_links?
      !@record.external? && @user.is?(:superadmin)
    end

    def enable_universal_link?
      @user.is?(:superadmin)
    end

    def attach_to_group?
      update?
    end
  end
end
