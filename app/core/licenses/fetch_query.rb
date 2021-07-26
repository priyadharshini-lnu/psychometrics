# frozen_string_literal: true

module Licenses
  class FetchQuery < Rectify::Query
    private_attr_reader :client, :report_family_id

    def initialize(client, report_family_id)
      @client = client
      @report_family_id = report_family_id
    end

    def query
      client.
        licenses.
        available.
        where(report_family_id: report_family_id, type: :common).
        order(end_date: :asc)
    end
  end
end
