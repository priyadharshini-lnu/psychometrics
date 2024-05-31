# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class SubFactorQuestionsSum < QuestionsSum
        def call
          factor = factor_data[:factor]

          results = SubFactorQuestions.get_results(factor_data, extended_scoring, factor_hash)&.
                    select { |r| !r.key?('max_value') || r['max_value'].present? }

          if results.present?
            score = calc_score(results)
            percentage = if factors_question_count[factor.id].present?
                           { 'percentage' => calc_percentage(results, factors_question_count[factor.id]) }
                         else
                           {}
                         end
          else
            score = nil
            percentage = {}
          end

          broadcast(:ok, extended_scoring.
            deep_merge(factor.id.to_s => { 'score' => round_score(score) }).
            deep_merge(factor.id.to_s => percentage))
        end
      end
    end
  end
end
