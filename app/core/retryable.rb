# frozen_string_literal: true

module Retryable
  def self.prepended(base)
    base.cattr_accessor :_retry_settings
  end

  def call
    return super if _retry_settings.blank?

    begin
      super
    rescue StandardError => e
      setting = _retry_settings.find do |s|
        s[:exceptions].find { |klass| e.is_a?(klass) }
      end

      raise if setting.nil?

      after_retry if setting[:retry_count] != 0 && respond_to?(:after_retry)

      if setting[:retry_count] == setting[:attempts]
        after_last_retry_fails if respond_to?(:after_last_retry_fails)
        setting[:retry_count] = 0
        raise
      end

      before_retry if respond_to?(:before_retry)
      setting[:retry_count] += 1
      retry
    end
  end
end
