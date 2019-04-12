# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class BaseController < Administration::BaseController
      append_before_action :pundit_authorize

      def threesixty_campaign
        @threesixty_campaign ||= ::Threesixty::Campaign.find_by(id: params[:threesixty_campaign_id])
      end
    end
  end
end
