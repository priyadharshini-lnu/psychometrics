# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class SubFactorQuestions < Questions
        def call
          factor = factor_data[:factor]

          results = SubFactorQuestions.get_results(factor_data, extended_scoring, factor_hash)&.
                    select { |r| !r.key?('max_value') || r['max_value'].present? }

          score = results.present? ? calc_score(results) : nil

          broadcast :ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => round_score(score) })
        end

        class << self
          def get_results(factor_data, extended_scoring, factor_hash)
            sub_factor_ids = factor_data[:sub_factor_hash].keys

            sub_factor_ids.map do |id|
              factor = factor_hash[id][:factor]
              result = extended_scoring.dig(id.to_s, 'results')
              result if result && (factor.questions_strategy? || factor.questions_sum_strategy?)
            end.flatten.compact
          end
        end
      end
    end
  end
end
