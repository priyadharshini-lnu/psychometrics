# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class QuestionsSum < Questions
        private

        def calc_score(results)
          factor = factor_data[:factor]
          if results.blank?
            0 if factors_question_count[factor.id]&.positive?
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
