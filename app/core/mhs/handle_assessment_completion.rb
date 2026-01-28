# frozen_string_literal: true

module Mhs
  class HandleAssessmentCompletion < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      all_mhs_reports = user_assessment.user_reports(:mhs)

      if user_assessment.users_result.external_results.present? && all_mhs_reports.all?(&:pdf_exists?)
        return broadcast :reports_and_scores_already_available
      end

      reports_to_be_generated = all_mhs_reports.select(&:generatable?)
      return broadcast :no_mhs_report_to_generate if reports_to_be_generated.empty?

      Mhs::SaveReportsAndScoresJob.set(wait: 1.minute).perform_later(user_assessment, reports_to_be_generated)
    end
  end
end
