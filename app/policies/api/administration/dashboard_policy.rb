# frozen_string_literal: true

module Api
  module Administration
    class DashboardPolicy < ::Api::Administration::BasePolicy
      def index?
        user.has_grant?(:dashboards, :view)
      end

      def show?
        has_permission?(:dashboards, :view, campaign_id: record.campaign_id)
      end

      def oracle_analytics_embed?
        user.admin?
      end

      def create?
        can_manage_dashboard?
      end

      def update?
        can_manage_dashboard?
      end

      def upload_image?
        can_manage_dashboard?
      end

      def powerbi_capacities?
        can_manage_dashboard?
      end

      def refresh?
        can_manage_dashboard?
      end

      def export_file?
        can_export_file?
      end

      private

      def can_manage_dashboard?
        user.is?(:superadmin)
      end

      def can_export_file?
        user.is?(:superadmin) || user.has_permission?(
          :dashboards, :export_file, project_id: project_id, campaign_id: campaign_id
        )
      end

      def project_id
        record.try(:project)&.id || record.try(:project_id)
      end

      def campaign_id
        record.try(:campaign_id)
      end

      class Scope < BasePolicy::Scope
        def resolve
          return Dashboard.all if user.is?(:superadmin)

          options = { group: :dashboards, permission: :view }
          campaign_ids = ::Administration::CampaignPolicy::Scope.new(user, Campaign,
                                                                     options).resolve.select do |campaign|
            user.has_permission?(:dashboards, :view, project_id: campaign.project_id, campaign_id: campaign.id)
          end
          Dashboard.where(campaign_id: campaign_ids)
        end
      end
    end
  end
end
