# frozen_string_literal: true

class ApplicationJob < ActiveJob::Base
  include Sidekiq::Throttled::Job
  include JobTracking
  include ControlException

  def self.discard_on(exception)
    rescue_from exception do |error|
      logger.error "Discarded #{self.class} due to a #{exception}. The original exception was #{error.cause.inspect}."
    end
  end

  discard_on ActiveJob::DeserializationError
end
