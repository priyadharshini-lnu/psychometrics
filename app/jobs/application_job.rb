class ApplicationJob < ActiveJob::Base
  def self.discard_on(exception)
    rescue_from exception do |error|
      logger.error "Discarded #{self.class} due to a #{exception}. The original exception was #{error.cause.inspect}."
    end
  end

  discard_on ActiveJob::DeserializationError
end
