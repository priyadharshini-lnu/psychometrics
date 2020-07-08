# frozen_string_literal: true

module Licenses
  class FetchQuery < Rectify::Query
    private_attr_reader :client, :report

    def initialize(client, report)
      @client = client
      @report = report
    end

    def query
      client.
        licenses.
        available.
        with_report_family(report.report_family_ids).
        where(type: :common).
        order(end_date: :asc)
    end
  end
end
