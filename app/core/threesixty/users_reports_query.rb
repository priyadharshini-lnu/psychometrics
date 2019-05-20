module Threesixty
  class UsersReportsQuery < Rectify::Query
    def initialize(campaign, subjects)
      @campaign = campaign
      @user_ids = subjects.map(&:user_id)
    end

    def query
      UsersReport.where(campaign_id: @campaign.campaign_id, user_id: user_ids)
    end

    private

    attr_reader :subjects, :user_ids
  end
end
