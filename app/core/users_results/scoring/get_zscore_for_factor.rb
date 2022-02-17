# frozen_string_literal: true

module UsersResults
  module Scoring
    class GetZscoreForFactor < BaseCommand
      attr_reader :factor, :score, :factor_norm

      def initialize(factor, score, factor_norm)
        @factor = factor
        @score = score
        @factor_norm = factor_norm
      end

      def call
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
