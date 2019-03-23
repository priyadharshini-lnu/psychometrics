module Errors
  module Api
    class EmailExistsError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)
        @message = 'User with this email exists'
        @code = 4003
        @status = :bad_request
      end
    end
  end
end
