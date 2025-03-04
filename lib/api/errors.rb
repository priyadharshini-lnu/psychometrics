# frozen_string_literal: true

module Api
  module Errors
    class ApiError < StandardError
      attr_reader :code, :message, :status, :more_info, :meta

      def initialize(more_info = nil, meta = nil)
        @more_info = more_info
        @meta = meta
      end
    end

    class InvalidAuthentication < ApiError
      def initialize(more_info = nil)
        super
        @message = 'Invalid authentication'
        @code = 1000
        @status = :unauthorized
      end
    end

    class ValidationFailed < ApiError
      def initialize(more_info = nil)
        super
        @message = 'Validation error'
        @code = 1002
        @status = :bad_request
      end
    end

    class NotEnoughLicences < ApiError
      def initialize(more_info = nil)
        super
        @message = 'Not enough licenses'
        @code = 1003
        @status = :forbidden
      end
    end

    class AssessmentsNotCompleted < ApiError
      def initialize(more_info = nil)
        super
        @message = 'Assessment not completed'
        @code = 1004
        @status = :forbidden
      end
    end

    class ResourceNotFound < ApiError
      def initialize(more_info = nil)
        super
        @message = 'Resource not found'
        @code = 1005
        @status = :not_found
      end
    end

    class EmailExists < ApiError
      def initialize(more_info = nil, meta = nil)
        super
        @message = 'User with this email exists'
        @code = 1006
        @status = :bad_request
      end
    end

    class ResourceNotConfigured < ApiError
      def initialize(more_info = nil)
        super

        @message = 'Resource not configured.'
        @code = 1007
        @status = :precondition_failed
      end
    end

    class Unauthorized < ApiError
      def initialize(more_info = nil)
        super
        @message = 'User not authorized to perform this action'
        @code = 1008
        @status = :unauthorized
      end
    end

    class InvalidRequest < ApiError
      def initialize(more_info = nil)
        super
        @message = 'Invalid request'
        @code = 1009
        @status = :bad_request
      end
    end

    class NewAssessmentResponseNotAllowed < ApiError
      def initialize(more_info = nil)
        super
        @message = 'New Assessment Response Not Allowed'
        @code = 1010
        @status = :forbidden
      end
    end
  end
end
