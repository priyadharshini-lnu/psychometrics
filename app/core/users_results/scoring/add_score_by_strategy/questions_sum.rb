# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class QuestionsSum < Questions
        def call
          super
        end

        private

        def calc_score(results)
          return nil if results.blank?

          results.sum do |result|
            res = Array.wrap(result['value'])
            res.sum / res.size.to_f
          end
        end
      end
    end
  end
end
