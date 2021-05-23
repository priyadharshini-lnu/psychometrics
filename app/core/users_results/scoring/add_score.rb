# frozen_string_literal: true

module UsersResults
  module Scoring
    class AddScore < BaseCommand
      attr_reader :factor_hash, :factor_ids, :scoring, :factors_question_count

      def initialize(factor_hash, factor_ids, scoring, factors_question_count = {})
        @factor_hash = factor_hash
        @factor_ids = factor_ids
        @scoring = scoring
        @factors_question_count = factors_question_count
      end

      def call
        extended_scoring = factor_hash.fetch_values(*factor_ids).reduce(scoring) do |extending_scoring, factor_data|
          factor = factor_data[:factor]

          factor_scoring = extending_scoring[factor.id.to_s]

          if factor_scoring&.key?('score')
            extending_scoring
          else
            module_name = "::UsersResults::Scoring::AddScoreByStrategy::#{factor.scoring_strategy.camelize}".constantize
            module_name.call!(factor_data, extending_scoring, factor_hash, factors_question_count)
          end
        end

        broadcast :ok, extended_scoring
      end
    end
  end
end
