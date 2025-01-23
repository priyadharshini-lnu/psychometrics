# frozen_string_literal: true

module UsersResults
  module Scoring
    class GetNormScoreForFactor < BaseCommand
      attr_reader :factor, :sub_factor_hash, :factor_hash, :norm, :scoring, :factor_norm

      def initialize(context)
        factor_id = context[:factor_id]
        factor_hash = context[:factor_hash]
        @factor = factor_hash.dig(factor_id, :factor)
        @sub_factor_hash = factor_hash.dig(factor_id, :sub_factor_hash)
        @factor_hash = factor_hash
        @scoring = context[:scoring]
        @factor_norm = context[:factor_norm]
        @norm = context[:norm]
      end

      def call
        score = scoring[factor.id.to_s]

        norm_score =
          if norm.percentile?
            calc_percentile_norm_score
          else
            return broadcast :ok, nil if score.nil?

            calc_standard_norm_score(score)
          end
        norm_score ||= score['percentage'] if factor&.use_percentage?

        broadcast :ok, norm_score
      end

      private

      def calc_standard_norm_score(score)
        factor_norm&.calc_norm_level(score['score'])
      end

      def calc_percentile_norm_score
        zscore = get_factor_zscore(factor.id)

        zscore ? Ztable.percentile(zscore) : nil
      end

      def get_factor_zscore(factor_id)
        factor_data = factor_hash[factor_id.to_i]
        return unless factor_data
        return scoring.dig(factor_id.to_s, 'zscore') unless factor_data[:factor].sub_factors_average_strategy?

        score_data = sub_factor_hash.each_with_object(sum: 0, count: 0) do |(k, v), data|
          zs = get_factor_zscore(k)
          break if !zs || !v.weight

          data[:sum] += zs * v.weight
          data[:count] += v.weight
        end
        score_data && score_data[:count].positive? ? score_data[:sum] / score_data[:count].to_f : nil
      end
    end
  end
end
