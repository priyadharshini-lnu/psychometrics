module Threesixty
  class ResetCampaignJob < ApplicationJob
    queue_as :default

    def perform(campaign_id)
      threesixty_campaign = Threesixty::Campaign.find(campaign_id)
      ::Threesixty::Campaigns::Reset.call(threesixty_campaign)
    end
  end
end
