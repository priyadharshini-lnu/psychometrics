# frozen_string_literal: true

class BaseCommand < Rectify::Command
  def self.inherited(base)
    base.prepend(Retryable)
  end

  def self.retry_on(*exceptions, attempts: 1)
    self._retry_settings ||= []
    self._retry_settings << {
      exceptions: exceptions,
      attempts: attempts,
      retry_count: 0
    }
  end

  def self.call!(*args)
    call(*args)[:ok]
  end
end
