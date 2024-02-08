# frozen_string_literal: true

module CampaignScoring
  class FactorValue
    attr_reader :value, :error

    def initialize(value, error = nil)
      @value = value
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
