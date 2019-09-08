# frozen_string_literal: true

module Facades
  module Assigns
    class MultipleReport
      attr_reader :report_id, :assigns_reports

      def initialize(report_id, assigns_reports, pundit_user)
        @report_id = report_id
        @pundit_user = pundit_user
        @assigns_reports = uniq_assigns_reports_by_assessment(assigns_reports)
      end

      def show?
        completed? && user_access?
      end

      private

      def completed?
        completed_count = @assigns_reports.count { |a| a.assign.assign_with_result.completed? }
        completed_count == assigns_reports.first.report.assessments.size
      end

      def user_access?
        ::ReportPolicy.new(@pundit_user, assigns_reports.first.report).show?
      end

      def uniq_assigns_reports_by_assessment(assigns_reports)
        assigns_reports.uniq { |assign_report| assign_report.assign.assessment_id }
      end
    end
  end
end
