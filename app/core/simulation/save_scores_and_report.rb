# frozen_string_literal: true

module Simulation
  class SaveScoresAndReport < Base
    private_attr_reader :user_assessment, :retry_count

    def initialize(user_assessment, retry_count: 0)
      @user_assessment = user_assessment
      @retry_count = retry_count
    end

    def call
      scores = Simulation::GetScores.call!(user_assessment)

      return retry_save_score if scores.blank?

      external_results = {
        meta_data: {
          createdAt: parse_datetime(scores['createdAt'])
        },
        scores: scores['scores'].first
      }

      user_assessment.users_result.update(external_results: external_results)

      completed_at = parse_datetime(scores['createdAt'])
      user_assessment.update(status: :completed, completed_at: completed_at) if completed_at
      generate_internal_reports

      broadcast :ok
    end

    private

    def parse_datetime(datetime_str)
      datetime_str&.in_time_zone('UTC')
    end

    def generate_internal_reports
      ::UsersResults::GenerateReports.call(user_assessment.users_result, user_assessment.user)
    end

    def retry_save_score
      Simulation::SaveScoresAndReportJob.
        set(wait: (2**retry_count).minute).
        perform_later(user_assessment, retry_count: retry_count + 1)
    end
  end
end
