# frozen_string_literal: true

module Administration
  module Campaigns
    class BaseController < Administration::Projects::BaseController
      include Administration::Clients
      before_action :ensure_campaign

      def campaign
        return nil unless params[:new_campaign_id]

        if action_name == 'dashboard'
          options = { group: :dashboards, permission: :view }
          @campaign ||= ::Administration::CampaignPolicy::Scope.new(current_user, Campaign,
                                                                    options).resolve.find(params[:new_campaign_id])
        else
          @campaign ||= policy_scope(Campaign).find(params[:new_campaign_id])
        end
      end
    end
  end
end
