# frozen_string_literal: true

module Iiht
  class UpdateAttempts < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      response = client.put(
        'UpdateUserAttempt',
        request_body.to_json
      )
      result = ::JSON.parse(response.body).dig('result')
      unless result['isSuccess']
        raise "UpdateUserAttempt failed for UserAssessment: #{user_assessment.id}. Error: #{result['errorMessage']}"
      end

      broadcast :ok, result
    end

    private

    def request_body
      {
        tenantId: config['tenant_id'],
        userEmail: user_assessment.user.email,
        scheduleId: user_assessment.iiht_user_assessment.schedule_id,
        updateAttemptCountBy: 1
      }
    end
  end
end
