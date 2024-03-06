# frozen_string_literal: true

module Hogan
  class HandleAssessmentCompletion < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      all_hogan_reports = user_assessment.user_reports(:hogan)
      if user_assessment.users_result.external_results.present? && all_hogan_reports.all?(&:pdf?)
        return broadcast :reports_and_scores_already_available
      end

      reports_to_be_generated = all_hogan_reports.select(&:generatable?)
      return broadcast :no_hogan_report_to_generate if reports_to_be_generated.empty?

      Hogan::SaveReportsAndScoresJob.set(wait: 1.minute).perform_later(reports_to_be_generated)
    end
  end
end
