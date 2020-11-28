# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class QuestionsSum < BaseStrategy
        def call
          factor = factor_data[:factor]
          results = extended_scoring.dig(factor.id.to_s, 'results')
          return  broadcast :ok, extended_scoring unless results

          score = calc_score(results)

          broadcast :ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => score })
        end

        private

        def calc_score(results)
          if results.blank?
            nil
          else
            results.sum do |result|
              res = Array.wrap(result['value'])
              res.sum / res.size.to_f
            end
          end
        end
      end
    end
  end
end
