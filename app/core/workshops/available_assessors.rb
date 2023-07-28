# frozen_string_literal: true

module Workshops
  class AvailableAssessors < Rectify::Query
    private_attr_reader :start_date_time, :end_date_time, :search_term

    def initialize(start_date_time, end_date_time, search_term: nil)
      @start_date_time = start_date_time
      @end_date_time = end_date_time
      @search_term = search_term
    end

    def query
      Users::SearchByAvailability.new(
        start_date_time,
        end_date_time,
        user_scope: User.global_assessors,
        search_term: search_term
      ).query
    end
  end
end
