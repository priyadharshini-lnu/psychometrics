# frozen_string_literal: true

module Assigns
  class GenerateReport < BaseCommand
    private_attr_reader :assign, :current_user

    def initialize(assign, current_user)
      @assign = assign
      @current_user = current_user
    end

    def call
      assigns_reports = assign.original_or_self.enabled_assigns_reports.includes(:report)
      assigns_reports = assigns_reports.select { |assigns_report| assigns_report.report.provider_internal? }
      AssignsReports::GenerateReport.call(assigns_reports, current_user, assign)
    end
  end
end
