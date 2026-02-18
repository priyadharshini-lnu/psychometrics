# frozen_string_literal: true

module Simulation
  class SaveScoresAndReport < Base
    private_attr_reader :user_assessment, :retry_count

    def initialize(user_assessment, decisions = nil, retry_count: 0)
      @user_assessment = user_assessment
      @retry_count = retry_count
      @decisions = decisions
    end

    def call
      return retry_save_answers if decisions.blank?

      user_assessment.users_result.update(meta_data: decisions['metadata'], answers: decisions['decisions'])

      user_assessment.update(status: :completed) unless user_assessment.completed?

      calculate_assessment_scores

      broadcast :ok
    end

    private

    def parse_datetime(datetime_str)
      datetime_str&.in_time_zone('UTC')
    end

    def calculate_assessment_scores
      UserAssessments::SaveScores.call!(user_assessment)
    end

    def decisions
      @decisions ||= Simulation::GetDecisions.call!(user_assessment)
    end

    def retry_save_answers
      Simulation::SaveScoresAndReportJob.
        set(wait: (2**retry_count).minute).
        perform_later(user_assessment, retry_count: retry_count + 1)
    end
  end
end
