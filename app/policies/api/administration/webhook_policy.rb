# frozen_string_literal: true

module Api
  module Administration
    class WebhookPolicy < BasePolicy
      def index?
        manage_webhooks?
      end

      def create?
        manage_webhooks?
      end

      def update?
        manage_webhooks?
      end

      def destroy?
        manage_webhooks?
      end

      def send_test?
        manage_webhooks?
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope = super.not_deleted

          return scope if user.is?(:superadmin)

          permitted_client_admin_project_ids = @user.client_admin_project_ids.select do |project_id|
            @user.has_permission?(:campaigns, :view, project_id: project_id)
          end

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?(:campaigns, :view, project_id: project_id)
          end

          scope.where(project_id: (permitted_client_admin_project_ids + permitted_project_admin_project_ids))
        end
      end

      private

      def manage_webhooks?
        has_permission?(:project_settings, :webhooks, project_id: project_id)
      end
    end
  end
end
