module Errors
  module Api
    class NotEnoughLicencesError < Errors::ApiError
      def initialize(more_info = nil)
        super(more_info)
        @message = 'Not enough licenses'
        @code = 1003
        @status = :forbidden
      end
    end
  end
end
