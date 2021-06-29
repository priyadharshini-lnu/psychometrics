# frozen_string_literal: true

module Saville
  class ResetAssessment < BaseCommand
    private_attr_reader :user_assessment, :subject

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @subject = user_assessment.subject
    end

    def call
      Saville::MakeRequest.call!(
        :process_assessment_cancel_request,
        'assessment_cancel_request.xml.erb',
        attributes
      )

      broadcast :ok
    end

    def attributes
      { receipt_id: user_assessment.saville_user_assessment.request_id }
    end
  end
end
