# frozen_string_literal: true

module CampaignScoring
  class CampaignFactorValueValidator < BaseCommand
    attr_reader :campaign_factor, :factor_value

    def initialize(campaign_factor, factor_value)
      @campaign_factor = campaign_factor
      @factor_value = factor_value
    end

    def call
      return if factor_value.nil?

      validate_hash_value
      @factor_value = extract_value(factor_value)

      return if factor_value.nil?

      validate_string_type
      validate_numeric_type
      validate_not_infinite
    end

    private

    def validate_hash_value
      if factor_value.is_a?(Hash) && !factor_value.key?(:value)
        raise CampaignScoring::Exceptions::WrongOutputType,
              'Expected factor value with type Hash to have a key :value. Got nil'
      end
    end

    def extract_value(value)
      value.is_a?(Hash) ? value[:value] : value
    end

    def validate_string_type
      if campaign_factor.string_output_type? && !factor_value.is_a?(String)
        raise CampaignScoring::Exceptions::WrongOutputType,
              "Expected factor value for '#{campaign_factor.code}' to be a string. Got #{factor_value.class.name}"
      end
    end

    def validate_numeric_type
      if campaign_factor.numeric_output_type? && !factor_value.is_a?(Numeric)
        raise CampaignScoring::Exceptions::WrongOutputType,
              "Expected factor value for '#{campaign_factor.code}' to be a numeric. Got #{factor_value.class.name}"
      end
    end

    def validate_not_infinite
      if factor_value.is_a?(Numeric) && factor_value.infinite?
        raise CampaignScoring::Exceptions::WrongOutputType,
              "Expected factor value for '#{campaign_factor.code}'. Got Infinity value"
      end
    end
  end
end
