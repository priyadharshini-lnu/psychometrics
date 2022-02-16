# frozen_string_literal: true

module UsersResults
  module Scoring
    class GetNormScoreForFactor < BaseCommand
      attr_reader :factor, :sub_factor_hash, :norm, :scoring, :factor_norm_hash

      def initialize(factor_data, norm, scoring, factor_norm_hash)
        @factor = factor_data[:factor]
        @sub_factor_hash = factor_data[:sub_factor_hash]
        @scoring = scoring
        @factor_norm_hash = factor_norm_hash
        @norm = norm
      end

      def call
        return broadcast :ok, scoring unless norm

        score = scoring.dig(factor.id.to_s)
        norm_score =
          if norm.percentile?
            calc_percentile_norm_score
          else
            calc_standard_norm_score(score)
          end
        norm_score ||= score['percentage'] if factor&.use_percentage?

        broadcast :ok, norm_score
      end

      private

      def calc_standard_norm_score(score)
        factor_norm = factor_norm_hash[factor.id]
        factor_norm&.calc_norm_level(score['score'])
      end

      def calc_percentile_norm_score
        zscore = get_factor_zscore(factor.id)

        zscore ? Ztable.percentile(zscore) : nil
      end

      def get_factor_zscore
        return scoring.dig(factor.id.to_s, 'zscore') unless factor.sub_factors_average_strategy?

        score_data = sub_factor_hash.each_with_object(sum: 0, count: 0) do |(k, v), data|
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
