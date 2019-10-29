# frozen_string_literal: true

module Errors
  module Api
    class EmailExistsError < Errors::ApiError
      def initialize(more_info = nil, meta = nil)
        super(more_info, meta)
        @message = 'User with this email exists'
        @code = 1006
        @status = :bad_request
      end
    end
  end
end
