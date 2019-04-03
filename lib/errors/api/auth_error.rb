module Errors
  module Api
    class AuthError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)
        @message = 'Invalid authentication'
        @code = 1000
        @status = :unauthorized
      end
    end
  end
end
