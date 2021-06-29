# frozen_string_literal: true

module Saville
  class GetAssessmentStatus < BaseCommand
    private_attr_reader :user_assessment, :subject

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @subject = user_assessment.subject
    end

    def call
      status = Saville::MakeRequest.call!(
        :process_assessment_status_request,
        'assessment_status_request.xml.erb',
        attributes
      ).dig('AssessmentResult', 'AssessmentStatus', 'Status')

      broadcast :ok, status
    end

    def attributes
      { receipt_id: user_assessment.saville_user_assessment.request_id }
    end
  end
end
