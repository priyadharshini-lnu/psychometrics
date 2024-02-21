# frozen_string_literal: true

module Assessors
  class AvailableAssessmentsQuery < Rectify::Query
    private_attr_reader :client

    def initialize(client)
      @client = client
    end

    def query
      Assessment.assessor_form.where("owner_id = #{client.id}")
    end
  end
end
