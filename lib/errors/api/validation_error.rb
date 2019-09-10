# frozen_string_literal: true

module Errors
  module Api
    class ValidationError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)
        @message = 'Validation error'
        @code = 1002
        @status = :bad_request
      end
    end
  end
end
