module Errors
  module Api
    class AssessmentIsNotPassedError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)
        @message = 'Assessment not completed'
        @code = 1004
        @status = :forbidden
      end
    end
  end
end
