# frozen_string_literal: true

module Errors
  module Api
    class ResourceNotConfiguredError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)

        @message = 'Resource not configured.'
        @code = 1007
        @status = :precondition_failed
      end
    end
  end
end
