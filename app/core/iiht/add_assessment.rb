# frozen_string_literal: true

module Iiht
  class AddAssessment < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      user = user_assessment.user
      response = client.get('testAndLearnerSpecificUrl',
                            {
                              email: user.email,
                              learnerfirstName: user.first_name,
                              learnerLastName: user.last_name,
                              testName: user_assessment.assessment.iiht_assessment_name,
                              companyId: config['company_id']
                            })
      url = ::JSON.parse(response.body).dig('data')
      user_assessment.iiht_user_assessment.update!(url: url)

      broadcast :ok
    end
  end
end
