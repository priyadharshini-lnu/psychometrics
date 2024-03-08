# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class QuestionsPercentage < BaseStrategy
        def call
          factor = factor_data[:factor]
          results = extended_scoring.dig(factor.id.to_s, 'results')&.
                    select { |r| !r.key?('max_value') || r['max_value'].present? }

          score = results.present? ? scale_score(calc_score(results)) : nil

          broadcast(:ok, extended_scoring.
            deep_merge(factor.id.to_s => { 'score' => score }))
        end

        private

        def calc_score(results)
          factor = factor_data[:factor]
          if results.blank?
            0 if factors_question_count[factor.id]&.positive?
          else
            sum_of_score = results.sum do |result|
              res = Array.wrap(result['value_sum'] || 0).compact
              res.sum
            end

            sum_of_max_values = results.sum { |result| result['max_value'] || 0 }

            return 0 if sum_of_max_values.zero?

            (sum_of_score / sum_of_max_values.to_f)
          end
        end

        def scale_score(score)
          return if score.nil?

          factor = factor_data[:factor]
          min = factor.scale_min || 0
          max = factor.scale_max || 1
          value = Utility::Number.scale(score, 0, 1, min, max)
          value.round(2)
        end
      end
    end
  end
end
