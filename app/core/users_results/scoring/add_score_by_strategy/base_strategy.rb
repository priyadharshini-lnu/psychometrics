# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class BaseStrategy < BaseCommand
        private_attr_reader :factor_data, :extended_scoring, :factor_hash, :norm,
                            :factor_norm_hash, :factors_question_count

        # rubocop:disable Metrics/ParameterLists
        def initialize(factor_data, extended_scoring, factor_hash, norm, factor_norm_hash, factors_question_count)
          @factor_data = factor_data
          @extended_scoring = extended_scoring
          @factor_hash = factor_hash
          @norm = norm
          @factor_norm_hash = factor_norm_hash
          @factors_question_count = factors_question_count
        end
        # rubocop:enable Metrics/ParameterLists
      end
    end
  end
end
