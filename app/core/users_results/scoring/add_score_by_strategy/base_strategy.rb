# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class BaseStrategy < BaseCommand
        private_attr_reader :factor_data, :extended_scoring, :factor_hash, :norm,
                            :factor_norm_hash, :factors_question_count, :external_results,
                            :visited_factor_ids, :answers

        def initialize(context)
          @factor_data = context[:factor_data]
          @extended_scoring = context[:extended_scoring]
          @factor_hash = context[:factor_hash]
          @norm = context[:norm]
          @factor_norm_hash = context[:factor_norm_hash]
          @external_results = context[:external_results]
          @factors_question_count = context[:factors_question_count]
          @visited_factor_ids = context[:visited_factor_ids]
          @answers = context[:answers] || {}
        end

        def round_score(score, default_precision = nil)
          return score if score.nil? || !score.is_a?(Numeric)

          precision = factor_data[:factor].precision || default_precision
          precision ? score.round(precision) : score
        end
      end
    end
  end
end
