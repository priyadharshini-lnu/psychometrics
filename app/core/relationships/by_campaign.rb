module Relationships
  class ByCampaign < Rectify::Query
    def initialize(campaigns)
      @campaigns = campaigns
    end

    def query
      Relationship.where(type: :global).or(Relationship.where(campaign_id: campaigns.map(&:id)))
    end

    private

    attr_reader :campaigns
  end
end
