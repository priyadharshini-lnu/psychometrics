module Threesixty
  class UsersReportsQuery < Rectify::Query
    def initialize(campaign, subjects, current_user)
      @campaign = campaign
      @user_ids = subjects.query.select do |subject|
        subject.user_id != current_user.id || subject.report_approved?
      end.map(&:user_id)
    end

    def query
      UsersReport.where(campaign_id: @campaign.campaign_id, user_id: user_ids)
    end

    private

    attr_reader :subjects, :user_ids
  end
end
