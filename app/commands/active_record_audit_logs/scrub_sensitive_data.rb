# frozen_string_literal: true

module ActiveRecordAuditLogs
  class ScrubSensitiveData < BaseCommand
    attr_reader :audited_changes

    COLUMNS_TO_EXCLUDE = [/.*password.*/, /.*_iv/, /.*_encrypted/].freeze

    def initialize(audited_changes)
      @audited_changes = audited_changes
    end

    def call
      result = keys_to_exclude(audited_changes)

      broadcast :ok, result
    end

    private

    def keys_to_exclude(changes)
      case changes
        when Hash
          changes.reject { |key, _value| COLUMNS_TO_EXCLUDE.any? { |regex| regex =~ key } }.
            transform_values { |value| keys_to_exclude(value) }
        when Array
          changes.map { |item| keys_to_exclude(item) }
        else
          changes
      end
    end
  end
end
