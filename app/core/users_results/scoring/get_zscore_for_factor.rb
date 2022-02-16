# frozen_string_literal: true

module UsersResults
  module Scoring
    class GetZscoreForFactor < BaseCommand
      attr_reader :factor, :score, :norm, :factor_norm_hash

      def initialize(factor, score, norm, factor_norm_hash)
        @factor = factor
        @score = score
        @norm = norm
        @factor_norm_hash = factor_norm_hash
      end

      def call
        return broadcast :ok, score if !norm || !norm.percentile?

        factor_norm = factor_norm_hash[factor.id]
        props = factor_norm&.props&.first || {}
        mean = props['mean']
        standard_deviation = props['standard_deviation']

        zscore =
          if [mean, standard_deviation, score].any?(&:blank?)
            nil
          else
            ((score.to_f - mean.to_f) / standard_deviation.to_f).round(5)
          end

        broadcast :ok, zscore
      end
    end
  end
end
