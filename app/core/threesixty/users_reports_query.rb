module Threesixty
  class UsersReportsQuery < Rectify::Query
    def initialize(campaign, subjects)
      @campaign = campaign
      @options = campaign.option
      @subjects = subjects
    end

    def query
      UsersReport.where(campaign_id: @campaign.campaign_id, user_id: user_ids)
    end

    private

    def user_ids
      subjects.map(&:user_id)
    end

    attr_reader :subjects
  end
end
