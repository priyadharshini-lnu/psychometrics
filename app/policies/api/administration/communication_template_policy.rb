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

      def copy?
        record_permitted?(:view)
      end

      def copy_to?
        return false unless feature_enabled?(project_id: project_id, campaign_id: campaign_id)
        return true if @user.is?(:superadmin)

        has_permission?(:communications, :view)
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

          permitted_client_ids = permitted_client_admin_client_ids.uniq & active_client_ids
          permitted_project_ids = filter_projects_by_active_client(project_admin_project_ids.uniq)
          campaigns = campaign_admin_campaign_ids
          scoped = base_scope.where(level: :platform)
          scoped = scoped.or(base_scope.where(client_id: permitted_client_ids)) if permitted_client_ids.any?
          scoped = scoped.or(base_scope.where(project_id: permitted_project_ids)) if permitted_project_ids.any?

          expand_scope_for_campaign_admins(base_scope, scoped, campaigns)
        end

        private

        def expand_scope_for_campaign_admins(base_scope, scoped, campaigns)
          return scoped if campaigns.empty?

          client_ids = campaigns.filter_map { |campaign| campaign.project&.parent_id }.uniq
          project_ids = campaigns.map(&:project_id).uniq
          campaign_ids = campaigns.map(&:id)

          scoped.
            or(base_scope.where(level: :client, client_id: client_ids)).
            or(base_scope.where(level: :project, project_id: project_ids)).
            or(base_scope.where(level: :campaign, campaign_id: campaign_ids))
        end
      end

      private

      # Templates live at platform/client/project/campaign level; platform ones resolve to no scope at
      # all, which Client.communication_center_active? deliberately treats as enabled.
      def record_scope
        { project_id: record&.project_id || record&.client_id, campaign_id: record&.campaign_id }
      end

      def record_feature_enabled?
        return false unless Settings.features.communication_center_enabled
        return true if record&.client_id.blank? && record&.project_id.blank? && record&.campaign_id.blank?

        ActsAsTenant.without_tenant do
          template_client&.feature_enabled?(:use_new_communication_center) || false
        end
      end

      def template_client
        ActsAsTenant.without_tenant do
          if record&.client_id.present?
            Client.find_by(id: record.client_id)
          elsif record&.campaign_id.present?
            Campaign.find_by(id: record.campaign_id)&.client
          elsif record&.project_id.present?
            Client.find_by(id: record.project_id)&.client
          end
        end
      end
    end
  end
end
