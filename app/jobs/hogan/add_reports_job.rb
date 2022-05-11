# frozen_string_literal: true

module Hogan
  class AddReportsJob < ApplicationJob
    queue_as :default

    private_attr_reader :user_result, :user_reports, :credentials, :project, :user_assessment

    def perform(user_assessment, user_reports, credentials, project)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @user_reports = user_reports
      @credentials = credentials
      @project = project

      assign_assessment_and_reports
      if user_assessment.completed?
        Hogan::FetchResultsJob.set(wait: 30.seconds).perform_later(user_result, credentials, project)
      end
    end

    private

    def assign_assessment_and_reports
      Hogan::AddReports.call!(
        group: project.hogan_group_name,
        credentials: credentials,
        user_result: user_result.evaluator_id,
        assessment: user_result.assessment,
        reports: user_reports
      )
    end
  end
end
