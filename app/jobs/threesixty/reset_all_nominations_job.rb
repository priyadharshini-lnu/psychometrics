module Threesixty
  class ResetAllNominationsJob < ApplicationJob
    queue_as :default

    def perform(campaign_id)
      threesixty_campaign = Threesixty::Campaign.find(campaign_id)
      ::Threesixty::Campaigns::ResetAllNominations.call(threesixty_campaign)
    end
  end
end
