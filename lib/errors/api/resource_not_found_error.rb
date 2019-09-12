# frozen_string_literal: true

module Errors
  module Api
    class ResourceNotFoundError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)
        @message = 'Resource not found'
        @code = 1005
        @status = :not_found
      end
    end
  end
end
