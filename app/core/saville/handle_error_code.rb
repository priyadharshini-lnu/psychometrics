# frozen_string_literal: true

module Saville
  class HandleErrorCode < BaseCommand
    ALREADY_STARTED_ERROR_CODE = '14'

    def initialize(error_code, user_assessment)
      @error_code = error_code
      @user_assessment = user_assessment
    end

    def call
      if error_code == ALREADY_STARTED_ERROR_CODE
        user_assessment.update!(
          status: :timed_out,
          completion_reason: :time_out_offline
        )
      end

      saville_user_assessment.update!(error_code: error_code)
    end

    private

    attr_reader :error_code, :user_assessment

    def saville_user_assessment
      @saville_user_assessment ||= user_assessment.saville_user_assessment
    end
  end
end
