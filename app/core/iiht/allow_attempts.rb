# frozen_string_literal: true

module Iiht
  class AllowAttempts < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      response = Iiht::GetScores.call!(user_assessment)
      schedule = response.dig('schedules')&.find do |s|
        s['scheduleId'] == user_assessment.iiht_user_assessment.schedule_id
      end
      return broadcast :ok if schedule.blank?

      Iiht::UpdateAttempts.call!(user_assessment) if schedule['availedAttempts'] >= schedule['maxAttempts']

      broadcast :ok
    end
  end
end
