# frozen_string_literal: true

module ActiveRecordAuditLogs
  module HistoryDateRange
    Error = Class.new(StandardError)

    DEFAULT_DAYS = 7
    MAX_DAYS = 30

    module_function

    def resolve(start_value, end_value)
      end_time = parse(end_value)
      start_time = parse(start_value)

      end_time ||= start_time ? start_time + DEFAULT_DAYS.days : Time.current
      start_time ||= end_time - DEFAULT_DAYS.days

      validate!(start_time, end_time)

      start_time..end_time
    end

    def validate!(start_time, end_time)
      raise Error, I18n.t('admin.record_history_date_range_invalid') if end_time < start_time
      return unless end_time - start_time > MAX_DAYS.days

      raise Error, I18n.t('admin.record_history_date_range_too_large', days: MAX_DAYS)
    end

    def parse(value)
      return if value.blank?

      Time.zone.parse(value.to_s)
    rescue ArgumentError
      nil
    end
  end
end
