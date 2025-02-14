# frozen_string_literal: true

module Hogan
  module Exceptions
    class NewAssessmentResponseNotAllowed < StandardError
      def initialize(email, assessment_name)
        @email = email
        @assessment_name = assessment_name
        super(message)
      end

      def message
        I18n.t('administration.hogan.errors.new_assessment_response_not_allowed.detailed_error_message',
               email: @email,
               assessment_name: @assessment_name)
      end

      def short_message
        I18n.t('administration.hogan.errors.new_assessment_response_not_allowed.short_error_message',
               email: @email,
               assessment_name: @assessment_name)
      end
    end
  end
end
