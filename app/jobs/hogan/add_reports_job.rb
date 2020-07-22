# frozen_string_literal: true

module Hogan
  class AddReportsJob < ApplicationJob
    queue_as :default

    private_attr_reader :user_result, :reports, :credentials, :project, :user_assessment

    def perform(user_assessment, reports, credentials, project)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @reports = reports
      @credentials = credentials
      @project = project

      assign_assessment_and_reports
      load_results if user_result.completed?
    end

    private

    def assign_assessment_and_reports
      Hogan::AddReports.call!(
        group: project.hogan_group_name,
        credentials: credentials,
        user_result: user_result.evaluator_id,
        assessment: user_result.assessment,
        reports: reports
      )
    end

    def load_results
      reports.each do |report|
        Hogan::FetchResults.call!(user_assessment, report, credentials, project) if report.hogan?
      end
    end
  end
end
