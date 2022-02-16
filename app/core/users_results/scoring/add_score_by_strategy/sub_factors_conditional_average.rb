# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class SubFactorsConditionalAverage < SubFactorsAverage
        def calc_score(scoring)
          score_data = scoring.each_with_object(sum: 0, count: 0) do |(k, v), data|
            factor_sub_factor = factor_data[:sub_factor_hash][k.to_i]
            score = get_sub_factor_score(v)
            data[:sum] += factor_sub_factor.weight if valid_score?(factor_sub_factor, score)
            data[:count] += factor_sub_factor.weight
          end
          return nil if score_data[:count] == 0

          score_data[:sum] * 100 / score_data[:count].to_f
        end

        def valid_score?(factor_sub_factor, score)
          score.public_send(factor_sub_factor.predicate, factor_sub_factor.value)
        end
      end
    end
  end
end
