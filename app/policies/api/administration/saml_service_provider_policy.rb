# frozen_string_literal: true

module Api
  module Administration
    class SamlServiceProviderPolicy < BasePolicy
      def index?
        can_manage_saml_setting?
      end

      def create?
        can_manage_saml_setting?
      end

      def update?
        can_manage_saml_setting?
      end

      def destroy?
        can_manage_saml_setting?
      end

      def rotate_certificate?
        can_manage_saml_setting?
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if user.is?(:superadmin)

          permitted_client_admin_project_ids = @user.client_admin_project_ids.select do |project_id|
            @user.has_permission?(:project_settings, :saml, project_id: project_id)
          end

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?(:project_settings, :saml, project_id: project_id)
          end

          scope.where(project_id: (permitted_client_admin_project_ids + permitted_project_admin_project_ids))
        end
      end

      private

      def can_manage_saml_setting?
        @user.is?(:superadmin) || @user.has_permission?(:project_settings, :saml, project_id: project_id)
      end
    end
  end
end
