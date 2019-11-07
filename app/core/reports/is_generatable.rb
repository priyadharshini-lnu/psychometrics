# frozen_string_literal: true

module Reports
  class IsGeneratable < BaseCommand
    private_attr_reader :report, :assign

    def initialize(report, assign)
      @report = report
      @assign = assign.assign_with_result
    end

    def call
      return broadcast :ok, assign.completed? unless report.multiple?

      broadcast :ok, all_assessments_are_complete?
    end

    private

    def all_assessments_are_complete?
      !Reports::IncompleteAssignsQuery.new(report, assign).query.exists?
    end
  end
end
