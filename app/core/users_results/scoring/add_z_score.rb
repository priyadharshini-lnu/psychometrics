# frozen_string_literal: true

module UsersResults
  module Scoring
    class AddZScore < BaseCommand
      attr_reader :scoring, :norm_data, :factor_norm_hash

      def initialize(scoring, norm_data, factor_norm_hash)
        @scoring = scoring
        @norm_data = norm_data
        @factor_norm_hash = factor_norm_hash
      end

      def call
        return broadcast :ok, scoring if !norm || !norm.percentile?

        extended_scoring = scoring.reduce({}) do |res, (factor_id, value)|
          factor_norm = factor_norm_hash[factor_id.to_i]
          props = factor_norm&.props&.first || {}
          mean = props['mean']
          standard_deviation = props['standard_deviation']

          zscore =
            if [mean, standard_deviation].any?(&:blank?)
              nil
            else
              factor_score = value['score']
              ((factor_score.to_f - mean) / standard_deviation).round(5)
            end
          res.merge(factor_id => value.merge('zscore' => zscore))
        end

        broadcast :ok, extended_scoring
      end

      private

      def norm
        @norm ||= Norm.find_by(id: norm_data['id'])
      end
    end
  end
end
