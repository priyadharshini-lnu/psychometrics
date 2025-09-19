# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class Questions < BaseStrategy
        def call
          factor = factor_data[:factor]
          results = extended_scoring.dig(factor.id.to_s, 'results')&.
                    select { |r| !r.key?('max_value') || r['max_value'].present? }
          total_questions = factors_question_count[factor.id] || 0

          if results.present?
            score = calc_score(results)
            percentage = if factors_question_count[factor.id].present?
                           { 'percentage' => calc_percentage(results, factors_question_count[factor.id]) }
                         else
                           {}
                         end
            stats = calc_statistics(results, total_questions)
          else
            score = nil
            percentage = {}
            stats = {}
          end

          broadcast(:ok, extended_scoring.
            deep_merge(factor.id.to_s => { 'score' => round_score(score, 2) }).
            deep_merge(factor.id.to_s => percentage).
            deep_merge(factor.id.to_s => stats))
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

            (sum_of_score / results.size.to_f)
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

        def calc_statistics(results, total_questions)
          questions_attempted = results.count { |r| r['value'].present? }

          question_counts = results.each_with_object({ correct: 0, partial: 0, incorrect: 0 }) do |result, acc|
            value = result['value']
            next if value.blank?

            total_value = Array.wrap(value).sum.to_f
            max_val = result['max_value'].presence&.to_f || 1.0

            if total_value >= max_val
              acc[:correct] += 1
            elsif total_value.positive?
              acc[:partial] += 1
            else
              acc[:incorrect] += 1
            end
          end

          questions_not_attempted = total_questions - questions_attempted

          {
            'questions_attempted' => questions_attempted,
            'total_questions' => total_questions,
            'questions_correct' => question_counts[:correct],
            'questions_partial_correct' => question_counts[:partial],
            'questions_incorrect' => question_counts[:incorrect],
            'questions_not_attempted' => questions_not_attempted
          }
        end
      end
    end
  end
end
