# frozen_string_literal: true

module Administration
  module Norms
    class PercentileNormFactor < Rectify::Form
      attribute :norm_id, Float
      attribute :factor_id, Float
      attribute :norm_type, String
      attribute :field_name, String
      attribute :field_value, Float

      validates :norm_id, :factor_id, :norm_type, :field_name, presence: true

      validates :field_name, inclusion: { in: %w[mean standard_deviation] }
      validates :field_value, numericality: { greater_than: 0 }, allow_nil: true
    end
  end
end
