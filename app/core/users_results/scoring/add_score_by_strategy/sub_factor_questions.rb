# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class SubFactorQuestions < Questions
        def call
          factor = factor_data[:factor]

          sub_factor_ids = factor_data[:sub_factor_hash].keys

          results = sub_factor_ids.map do |id|
            result = extended_scoring.dig(id.to_s, 'results')
            result if result && factor_hash[id][:factor].questions_strategy?
          end

          score = calc_score(results.flatten.compact)
          broadcast :ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => score })
        end
      end
    end
  end
end
