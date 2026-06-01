# frozen_string_literal: true

module Administration
  class SamlSettingPolicy < Administration::BasePolicy
    def create?
      can_manage_saml_setting?
    end

    def update?
      can_manage_saml_setting?
    end

    def test_saml?
      can_manage_saml_setting?
    end

    def parse_metadata?
      can_manage_saml_setting?
    end

    private

    def can_manage_saml_setting?
      @user.is?(:superadmin) || @user.has_permission?(:project_settings, :saml, project_id: project_id)
    end
  end
end
