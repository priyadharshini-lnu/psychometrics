# frozen_string_literal: true

module Iiht
  class SaveScores < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment, scores = nil)
      @user_assessment = user_assessment
      @scores = scores
    end

    def call
      schedule = scores.dig('schedules').find do |s|
        s['scheduleId'] == user_assessment.iiht_user_assessment.schedule_id
      end
      last_attempt = schedule['attempts'].last
      user_assessment.users_result.update(external_results: last_attempt)
      user_assessment.update(completed_at: last_attempt['actualEnd'].in_time_zone('UTC'))
      ::UsersResults::GenerateReports.call(user_assessment.users_result, user_assessment.user)

      broadcast :ok
    end

    private

    def scores
      @scores ||= Iiht::GetScores.call!(user_assessment)
    end
  end
end
