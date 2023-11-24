# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class Questions < BaseStrategy
        def call
          factor = factor_data[:factor]
          results = extended_scoring.dig(factor.id.to_s, 'results').
                    select { |r| !r.key?('max_value') || r['max_value'].present? }
          return  broadcast :ok, extended_scoring unless results

          score = calc_score(results)
          percentage = if factors_question_count[factor.id].present?
                         { 'percentage' => calc_percentage(results, factors_question_count[factor.id]) }
                       else
                         {}
                       end

          broadcast(:ok, extended_scoring.
            deep_merge(factor.id.to_s => { 'score' => score }).
            deep_merge(factor.id.to_s => percentage))
        end

        private

        def calc_score(results)
          factor = factor_data[:factor]
          if results.blank?
            0 if factors_question_count[factor.id]&.positive?
          else
            sum_of_score = results.sum do |result|
              res = Array.wrap(result['value'])
              res.sum / res.size.to_f
            end

            (sum_of_score / results.size.to_f).round(2)
          end
        end

        def calc_percentage(results, total_questions)
          if results.select { |r| r['value'].present? }.blank? || total_questions.nil?
            nil
          else
            correct_answer_count = results.sum do |result|
              res = Array.wrap(result['value'])
              res.sum.positive? ? 1 : 0
            end
            (correct_answer_count.to_f / total_questions).round(2) * 100
          end
        end
      end
    end
  end
end
