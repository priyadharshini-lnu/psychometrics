# frozen_string_literal: true

module Api
  module Administration
    class DashboardPolicy < ::Api::Administration::BasePolicy
      def index?
        # Everyone would be allowed to access this api, but would be restricted by Scope class
        true
      end

      def show?
        has_permission?(:dashboards, :view)
      end

      def create?
        user.is?(:superadmin)
      end

      def update?
        user.is?(:superadmin)
      end

      def create_with_campaign?(_)
        user.is?(:superadmin)
      end

      class Scope < Scope
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
