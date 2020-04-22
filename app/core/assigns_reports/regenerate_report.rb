# frozen_string_literal: true

module AssignsReports
  class RegenerateReport < BaseCommand
    private_attr_reader :assign_report, :current_user, :membership

    def initialize(assign_report, current_user, membership)
      @assign_report = assign_report
      @current_user = current_user
      @membership = membership
    end

    def call
      regenerate_mindmill_report if assign_report.report.mindmill?
      regenerate_hogan_report if assign_report.report.hogan?
      regenerate_internal_report if assign_report.report.provider_internal?

      broadcast :ok,
                report_generatable: @report_generatable,
                incomplete_assessment_names: @incomplete_assessment_names
    end

    private

    def regenerate_internal_report
      status = AssignsReports::GenerateReport.call!(assign_report, current_user)
      @report_generatable = status == AssignsReports::GenerateReport::ALL_SUCCESSFULL
      unless @report_generatable
        assessment_ids = Reports::IncompleteAssignsQuery.new(assign_report.report, assign_report.assign).query.
                         pluck(:assessment_id)
        @incomplete_assessment_names = Assessment.where(id: assessment_ids).pluck(:name).join(', ')
      end
    end

    def regenerate_mindmill_report
      @report_generatable = true
      assign_report.update_column(:generating, true)
      BuildMindmillResultsJob.perform_later(assign_report.assign.assign_with_result, membership)
    end

    def regenerate_hogan_report
      @report_generatable = true
      assign_report.update_column(:generating, true)
      Hogan::LoadResultsJob.
        perform_later(assign_report.assign, membership.membership_with_result, membership.project)
    end
  end
end
