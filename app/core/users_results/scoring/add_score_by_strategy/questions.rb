# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class Questions < BaseStrategy
        def call
          factor = factor_data[:factor]
          results = extended_scoring[factor.id.to_s]['results']

          score = calc_score(results)

          broadcast :ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => score })
        end

        private

        def calc_score(results)
          if results.blank?
            nil
          else
            sum_of_score = results.sum do |result|
              res = Array.wrap(result['value'])
              res.sum / res.size.to_f
            end

            (sum_of_score / results.size.to_f).round(2)
          end
        end
      end
    end
  end
end
