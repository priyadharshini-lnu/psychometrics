# frozen_string_literal: true

module Api
  module Administration
    class CommunicationEmailPolicy < CommunicationCenterPolicy
      def show?
        record_permitted?(:view)
      end

      def preview?
        record_permitted?(:view)
      end

      def cancel?
        record_permitted?(:manage)
      end

      def retrigger?
        record_permitted?(:manage)
      end

      def destroy?
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

          joined_scope = base_scope.joins(communication_delivery: :communication_template)
          joined_scope.where(communication_templates: { campaign_id: campaign_ids }).
            or(joined_scope.where(communication_deliveries: { project_id: project_ids }))
        end
      end

      private

      # A CommunicationEmail carries no scope of its own -- everything is resolved through its delivery.
      def record_scope
        { project_id: record&.communication_delivery&.project_id,
          campaign_id: record&.communication_delivery&.communication_template&.campaign_id }
      end

      # record is a real found CommunicationEmail, so reuse its delivery's own #client (already correctly
      # resolves campaign-or-project scope to the org-level client) directly, rather than re-deriving
      # project_id/campaign_id and routing through Client.communication_center_active?.
      def record_feature_enabled?
        Settings.features.communication_center_enabled &&
          (record&.communication_delivery&.client&.feature_enabled?(:use_new_communication_center) || false)
      end
    end
  end
end
