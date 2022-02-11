# frozen_string_literal: true

module Iiht
  class GetScores < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.get('getResultsForTestNew',
                            {
                              testName: user_assessment.assessment.iiht_assessment_name,
                              learnerEmail: user_assessment.user.email,
                              companyId: config['company_id']
                            })

      data = ::JSON.parse(response.body).dig('data')

      broadcast :ok, data
    end
  end
end
