# frozen_string_literal: true

module Iiht
  class GetScores < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      response = client.get('GetUserAssessmentResult', request_body)
      result = ::JSON.parse(response.body)['result']
      unless result['isSuccess']
        raise "IIHT::GetScores failed for UserAssessment: #{user_assessment.id}. Error: #{result['errorMessage']}"
      end

      broadcast :ok, result
    end

    private

    def request_body
      {
        assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
        userEmailAddress: user_assessment.iiht_user_assessment.email,
        tenantId: config['tenant_id']
      }
    end
  end
end
