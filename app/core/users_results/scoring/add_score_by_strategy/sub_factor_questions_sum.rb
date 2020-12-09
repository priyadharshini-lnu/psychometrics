# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class SubFactorQuestionsSum < QuestionsSum
        def call
          factor = factor_data[:factor]

          results = SubFactorQuestions.get_results(factor_data, extended_scoring, factor_hash)
          score = calc_score(results)

          broadcast :ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => score })
        end
      end
    end
  end
end
