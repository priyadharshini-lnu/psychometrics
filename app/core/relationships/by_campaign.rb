module Relationships
  class ByCampaign < Rectify::Query
    def initialize(campaign)
      @campaign = campaign
    end

    def query
      Relationship.where(type: :global).or(campaign.relationships)
    end

    private

    attr_reader :campaign
  end
end
