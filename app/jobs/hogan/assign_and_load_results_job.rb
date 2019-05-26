module Hogan
  class AssignAndLoadResultsJob < ApplicationJob
    queue_as :default

    def perform(assign_with_result, reports, membership_with_result, project)
      @assign_with_result = assign_with_result
      @reports = reports
      @membership_with_result = membership_with_result
      @project = project

      assign_assessment_and_reports
      load_results if assign_with_result.completed?
    end

    private

    attr_reader :assign_with_result, :reports, :membership_with_result, :project

    def assign_assessment_and_reports
      assessment_params = {
        group: project.hogan_group_name,
        membership: membership_with_result,
        assessment: assign_with_result.assessment,
        reports: reports,
      }
      ::Services::Hogan::AssignAssessmentAndReports.call!(assessment_params: assessment_params)
    end

    def load_results
      reports.each do |report|
        Hogan::LoadResults.call!(assign_with_result, report, membership_with_result, project)
      end
    end
  end
end
