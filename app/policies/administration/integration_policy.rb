# frozen_string_literal: true

module Administration
  class IntegrationPolicy < Administration::BasePolicy
    def index?
      can_manage_integrations?
    end

    def create?
      can_manage_integrations?
    end

    def update?
      can_manage_integrations?
    end

    def destroy?
      can_manage_integrations?
    end

    def load_mettl_assessments?
      can_manage_integrations?
    end

    def load_skillvue_assessments?
      can_manage_integrations?
    end

    def load_microsite_assessments?
      can_manage_integrations?
    end

    private

    def can_manage_integrations?
      @user.is?(:superadmin) || @user.has_permission?(:project_settings, :integrations, project_id: project_id)
    end
  end
end
