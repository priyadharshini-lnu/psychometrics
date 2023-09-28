# frozen_string_literal: true

module Workshops
  class AvailableManagers < Rectify::Query
    private_attr_reader :start_date_time, :end_date_time, :campaign_id, :search_term

    def initialize(start_date_time, end_date_time, campaign_id, search_term: nil)
      @start_date_time = start_date_time
      @end_date_time = end_date_time
      @campaign_id = campaign_id
      @search_term = search_term
    end

    def query
      Users::SearchByAvailability.new(
        start_date_time,
        end_date_time,
        user_scope: User.with_access_to_campaign(campaign_id),
        search_term: search_term
      ).query
    end
  end
end
