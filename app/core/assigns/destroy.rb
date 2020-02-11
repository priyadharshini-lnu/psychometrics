# frozen_string_literal: true

module Assigns
  class Destroy < BaseCommand
    private_attr_reader :assign

    def initialize(assign)
      @assign = assign
    end

    def call
      assign.assigns_reports.each do |assign_report|
        AssignsReports::GetAllWithSameReportQuery.new(assign_report).query.each(&:destroy!)
      end
      assign.destroy!
      broadcast :ok
    end
  end
end
