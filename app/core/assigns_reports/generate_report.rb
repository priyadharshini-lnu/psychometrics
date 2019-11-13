# frozen_string_literal: true

module AssignsReports
  class GenerateReport < BaseCommand
    NONE_SUCCESSFULL = :none_successfull
    SOME_SUCCESSFULL = :some_successfull
    ALL_SUCCESSFULL = :all_successfull

    private_attr_reader :assign, :assign_reports, :current_user

    def initialize(assign_reports, current_user, assign = nil)
      @assign_reports = Array.wrap(assign_reports)
      @current_user = current_user
      @assign = assign
    end

    def call
      generatable_assign_reports = assign_reports.select do |assigns_report|
        Reports::IsGeneratable.call!(assigns_report.report, assign || assigns_report.assign)
      end

      generatable_assign_reports.each do |assigns_report|
        AssignsReports::GetAllWithSameReportQuery.new(assigns_report).query.update_all(generating: true)
        ::Reports::ExportJob.perform_later(assigns_report, current_user)
      end

      return broadcast :ok, NONE_SUCCESSFULL if generatable_assign_reports.length.zero?
      return broadcast :ok, ALL_SUCCESSFULL if generatable_assign_reports.length == assign_reports.length

      broadcast :ok, SOME_SUCCESSFULL
    end
  end
end
