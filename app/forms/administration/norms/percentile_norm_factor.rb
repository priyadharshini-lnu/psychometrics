# frozen_string_literal: true

module Administration
  module Norms
    class PercentileNormFactor < Rectify::Form
      attribute :norm_id, Float
      attribute :factor_id, Float
      attribute :norm_type, String
      attribute :field_value, String
      attribute :field_name, String

      validates :norm_id, :factor_id, :norm_type, :field_name, :field_value, presence: true

      validates :field_name, inclusion: { in: %w[mean standard_deviation] }
      validates :field_value, numericality: { greater_than_or_equal_to: 1 }
    end
  end
end
