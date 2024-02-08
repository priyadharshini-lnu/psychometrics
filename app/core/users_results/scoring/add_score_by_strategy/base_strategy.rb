# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class BaseStrategy < BaseCommand
        private_attr_reader :factor_data, :extended_scoring, :factor_hash, :norm,
                            :factor_norm_hash, :factors_question_count, :external_results,
                            :visited_factor_ids

        # rubocop:disable Metrics/ParameterLists
        def initialize(
          factor_data, extended_scoring, factor_hash, norm, factor_norm_hash, external_results, factors_question_count,
          visited_factor_ids
        )
          @factor_data = factor_data
          @extended_scoring = extended_scoring
          @factor_hash = factor_hash
          @norm = norm
          @factor_norm_hash = factor_norm_hash
          @external_results = external_results
          @factors_question_count = factors_question_count
          @visited_factor_ids = visited_factor_ids
        end
        # rubocop:enable Metrics/ParameterLists
      end
    end
  end
end
