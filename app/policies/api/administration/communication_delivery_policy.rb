# frozen_string_literal: true

module Api
  module Administration
    class CommunicationDeliveryPolicy < CommunicationCenterPolicy
      def show?
        record_permitted?(:view)
      end

      # Delivery has no general update? -- cancel/destroy/update_translation are all gated by the same
      # manage permission on the delivery's project or its template's campaign.
      def cancel?
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
          base_scope = scope.all
          return base_scope.none unless Settings.features.communication_center_enabled
          return base_scope if user.is?(:superadmin)
          return base_scope.none unless user.has_grant?(:communications, :view)

          campaign_ids, project_ids = permitted_campaign_and_project_ids
          return base_scope.none if campaign_ids.empty? && project_ids.empty?

          # Both branches must share the same join for #or to be structurally compatible; project_id lives
          # on communication_deliveries itself so it's unambiguous even with communication_template joined.
          joined_scope = base_scope.joins(:communication_template)
          joined_scope.where(communication_templates: { campaign_id: campaign_ids }).
            or(joined_scope.where(project_id: project_ids))
        end
      end

      private

      def record_scope
        { project_id: record&.project_id, campaign_id: record&.communication_template&.campaign_id }
      end

      # record is a real found CommunicationDelivery, so reuse its own #client (already correctly resolves
      # campaign-or-project scope to the org-level client) directly, rather than re-deriving
      # project_id/campaign_id and routing through Client.communication_center_active?.
      def record_feature_enabled?
        Settings.features.communication_center_enabled &&
          (record&.client&.feature_enabled?(:use_new_communication_center) || false)
      end
    end
  end
end
