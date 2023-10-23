# frozen_string_literal: true

module Api
  module Administration
    class ReportPolicy < ::Administration::ReportPolicy
      def show?
        has_permission?(:reports, :view, project_id: @record.owner_id)
      end

      def manage?
        has_permission?(:reports, :manage, project_id: @record.owner_id)
      end

      def copy?
        manage?
      end

      def restore?
        manage?
      end

      def destroy?
        manage?
      end

      # Write other report policy methods here

      class Scope < Scope
        def resolve
          scope = super
          return scope if @user.is?(:superadmin)

          owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids

          owner_ids.concat(@user.campaign_admin_client_ids) if @user.is?(:campaign_admin)

          permitted_owner_ids = owner_ids.uniq.select do |owner_id|
            @user.has_permission?(:reports, :view, project_id: owner_id)
          end

          scope.enabled.available_to_view.where(owner_id: permitted_owner_ids)
        end
      end
    end
  end
end
