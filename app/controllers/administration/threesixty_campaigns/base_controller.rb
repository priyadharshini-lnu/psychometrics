# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class BaseController < Administration::BaseController
      append_before_action :pundit_authorize

      def threesixty_campaign
        @threesixty_campaign ||= ::Threesixty::Campaign.find_by(id: params[:threesixty_campaign_id])
      end

      def pundit_authorize
        authorize(resource || resource_class, nil, threesixty_campaign: threesixty_campaign)
      end
    end
  end
end
