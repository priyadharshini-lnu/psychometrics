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

      private

      def can_manage_dashboard?
        user.is?(:superadmin)
      end

      class Scope < BasePolicy::Scope
        def resolve
          return Dashboard.all if user.is?(:superadmin)

          campaign_ids = ::Administration::CampaignPolicy::Scope.new(user, Campaign).resolve.select do |campaign|
            user.has_permission?(:dashboards, :view, project_id: campaign.project_id, campaign_id: campaign.id)
          end
          Dashboard.where(campaign_id: campaign_ids)
        end
      end
    end
  end
end
