# frozen_string_literal: true

module Pearson
  class GetScheduleStatus < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      schedule_id = user_assessment.pearson_user_assessment.schedule_id
      response = client.get("v1/schedules/#{schedule_id}")
      status = ::JSON.parse(response.body).dig('data', 'status')

      broadcast :ok, status
    end
  end
end
