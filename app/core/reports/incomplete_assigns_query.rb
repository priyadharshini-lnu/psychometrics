# frozen_string_literal: true

module Reports
  class IncompleteAssignsQuery < Rectify::Query
    private_attr_reader :report, :assign

    def initialize(report, assign)
      @report = report
      @assign = assign.assign_with_result
    end

    def query
      assign.membership.assigns.where(assessment_id: report.assessments.pluck(:id)).
        where.not(status: 'completed')
    end
  end
end
