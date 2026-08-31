# frozen_string_literal: true

module ActiveRecordAuditLogs
  class ScrubSensitiveData < BaseCommand
    attr_reader :audited_changes

    COLUMNS_TO_EXCLUDE = [
      /password/i,
      /token/i,
      /secret/i,
      /(?:^|_)api_key(?:_|$)/i,
      /(?:^|_)access_key(?:_|$)/i,
      /private_key/i,
      /public_key/i,
      /cert(ificate)?/i,
      /otp/i,
      /_iv\z/i,
      /_encrypted\z/i
    ].freeze
    MASKED_VALUE = '****'

    def initialize(audited_changes)
      @audited_changes = audited_changes
    end

    def call
      broadcast :ok, scrub(audited_changes)
    end

    private

    def scrub(changes)
      case changes
        when Hash
          changes.each_with_object({}) do |(key, value), scrubbed|
            scrubbed[key] = sensitive_key?(key) ? masked_value(value) : scrub(value)
          end
        when Array
          changes.map { |item| scrub(item) }
        else
          changes
      end
    end

    def sensitive_key?(key)
      COLUMNS_TO_EXCLUDE.any? { |regex| regex =~ key.to_s }
    end

    def masked_value(value)
      case value
        when Hash
          value.transform_values { |nested| masked_value(nested) }
        when Array
          value.map { |item| masked_value(item) }
        else
          MASKED_VALUE
      end
    end
  end
end
