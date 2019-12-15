# frozen_string_literal: true

module AssignsReports
  class GetAllWithSameReportQuery < Rectify::Query
    private_attr_reader :assigns_report

    def initialize(assigns_report)
      @assigns_report = assigns_report
    end

    def query
      assign_ids = assigns_report.assign.membership.assigns.map(&:id)
      AssignsReport.where(assign_id: assign_ids, report_id: assigns_report.report_id)
    end
  end
end
