# frozen_string_literal: true

module ControlException
  extend ActiveSupport::Concern

  DEFAULT_SUPPRESSION_THRESHOLD = 3

  class_methods do
    def track_exceptions(exception_classes:, consecutive_failure_count: DEFAULT_SUPPRESSION_THRESHOLD)
      rescue_from SuppressedExceptionError do |error|
        logger.error(
          "Platform exception discarded #{error.original_error.class} due to a #{SuppressedExceptionError}." \
          "The original exception was #{error.original_error.inspect}."
        )
      end

      around_perform do |_job, block|
        suppress_exceptions_beyond_threshold(
          exception_classes: exception_classes,
          identfier_args: identfier_args,
          threshold: consecutive_failure_count
        ) do
          block.call
        end
      end
    end
  end

  private

  def suppress_exceptions_beyond_threshold(exception_classes:, identfier_args:, threshold:)
    exception_tracker = PlatformException.find_or_create_by!(**identfier_args)

    begin
      yield
      exception_tracker.reset_counter!
    rescue *exception_classes => e
      exception_tracker.handle_exception!(e, threshold)
    end
  end

  def identfier_args
    {
      identifier: self.class.name
    }
  end
end
