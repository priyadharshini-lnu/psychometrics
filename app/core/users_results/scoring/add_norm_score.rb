# frozen_string_literal: true

module UsersResults
  module Scoring
    class AddNormScore < BaseCommand
      attr_reader :scoring, :norm_data, :factor_hash, :factor_norm_hash

      def initialize(scoring, norm_data, factor_hash, factor_norm_hash)
        @scoring = scoring
        @norm_data = norm_data
        @factor_hash = factor_hash
        @factor_norm_hash = factor_norm_hash
      end

      def call
        extended_scoring = scoring.reduce({}) do |extending_scoring, (factor_id, value)|
          norm_score =
            if norm.percentile?
              calc_percentile_norm_score(factor_id)
            else
              calc_standard_norm_score(factor_id, value)
            end
          extending_scoring.merge(factor_id => value.merge('norm_score' => norm_score))
        end

        broadcast :ok, extended_scoring
      end

      private

      def norm
        @norm ||= Norm.find_by(id: norm_data['id'])
      end

      def calc_standard_norm_score(factor_id, value)
        factor_norm = factor_norm_hash[factor_id.to_i]
        factor_norm&.calc_norm_level(value['score'])
      end

      def calc_percentile_norm_score(factor_id)
        zscore = get_factor_zscore(factor_id)

        zscore ? Ztable.percentile(zscore) : nil
      end

      def get_factor_zscore(factor_id)
        factor_data = factor_hash[factor_id.to_i]
        return scoring.dig(factor_id.to_s, 'zscore') unless factor_data[:factor].sub_factors_average_strategy?

        score_data = factor_data[:sub_factor_hash].each_with_object(sum: 0, count: 0) do |(k, v), data|
          zs = get_factor_zscore(k)
          break if !zs || !v.weight

          data[:sum] += zs * v.weight
          data[:count] += v.weight
        end
        score_data ? score_data[:sum] / score_data[:count].to_f : nil
      end
    end
  end
end
