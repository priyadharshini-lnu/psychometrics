module Threesixty
  class CampaignDecorator < BaseDecorator
    def name
      object.campaign.name
    end
  end
end
