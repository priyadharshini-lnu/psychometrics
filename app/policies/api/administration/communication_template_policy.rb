# frozen_string_literal: true

module Api
  module Administration
    class CommunicationTemplatePolicy < CommunicationCenterPolicy
      def show?
        record_permitted?(:view)
      end

      def update?
        record_permitted?(:manage)
      end

      def destroy?
        record_permitted?(:manage)
      end

      def update_translation?
        record_permitted?(:manage)
      end

      class Scope < CommunicationCenterPolicy::Scope
        def resolve
          # Platform-level templates are intentionally tenant-less (tenant_id: nil) so they're visible
          # from every client/project/campaign. acts_as_tenant's default scope would otherwise silently
          # filter them out under any real (tenant-scoped) request -- build the base relation once,
          # outside tenant scoping, and rely on the explicit level/client_id/project_id/campaign_id
          # conditions below (not tenant_id) as the actual authorization boundary.
          base_scope = ActsAsTenant.without_tenant { scope.all }
          return base_scope.none unless Settings.features.communication_center_enabled
          return base_scope if user.is?(:superadmin)
          return base_scope.none unless user.has_grant?(:communications, :view)

          permitted_client_ids = permitted_client_admin_client_ids
          permitted_project_ids = project_admin_project_ids

          scoped = base_scope.where(level: :platform)
          scoped, permitted_client_ids, permitted_project_ids =
            fold_in_campaign_admin_ancestry(base_scope, scoped, permitted_client_ids, permitted_project_ids)

          permitted_client_ids = permitted_client_ids.uniq & active_client_ids
          permitted_project_ids = filter_projects_by_active_client(permitted_project_ids.uniq)

          scoped = scoped.or(base_scope.where(client_id: permitted_client_ids)) if permitted_client_ids.any?
          scoped = scoped.or(base_scope.where(project_id: permitted_project_ids)) if permitted_project_ids.any?

          scoped
        end

        private

        # A campaign admin's own admin membership doesn't grant client/project admin rights, so
        # has_permission? in #resolve never sees them -- fold in their campaigns' own ancestry
        # directly, otherwise "include inherited" never shows the client/project templates they
        # inherit from. Campaigns whose owning client has use_new_communication_center disabled are
        # dropped here so they never reach the client_id/project_id/campaign_id scoping below.
        def fold_in_campaign_admin_ancestry(base_scope, scoped, permitted_client_ids, permitted_project_ids)
          return [scoped, permitted_client_ids, permitted_project_ids] unless user.is?(:campaign_admin)

          campaigns = campaign_admin_campaign_ids
          client_ids = permitted_client_ids + campaigns.filter_map { |campaign| campaign.project&.parent_id }
          project_ids = permitted_project_ids + campaigns.map(&:project_id)
          scoped = scoped.or(base_scope.where(campaign_id: campaigns.map(&:id)))

          [scoped, client_ids, project_ids]
        end
      end

      private

      # Templates live at platform/client/project/campaign level; platform ones resolve to no scope at
      # all, which Client.communication_center_active? deliberately treats as enabled.
      def record_scope
        { project_id: record&.project_id || record&.client_id, campaign_id: record&.campaign_id }
      end
    end
  end
end
