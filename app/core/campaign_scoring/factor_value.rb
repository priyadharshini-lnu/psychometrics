# frozen_string_literal: true

module CampaignScoring
  class FactorValue
    attr_reader :value, :label, :error

    def initialize(value, error = nil)
      @value = value.is_a?(Hash) ? value[:value] : value
      @label = value.is_a?(Hash) ? value[:label] : nil
      @error = error
    end

    def error?
      error.present?
    end

    def error_message
      error&.message
    end
  end
end
