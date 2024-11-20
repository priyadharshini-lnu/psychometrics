# frozen_string_literal: true

module UsersResults
  module Scoring
    class AddScore < BaseCommand
      attr_reader :factor_hash, :factor_ids, :scoring, :norm, :factor_norm_hash,
                  :external_results, :factors_question_count, :visited_factor_ids, :answers

      # rubocop:disable Metrics/ParameterLists
      def initialize(
        factor_hash, factor_ids, scoring, norm, factor_norm_hash, external_results, factors_question_count = {},
        visited_factor_ids = Set.new, answers = {}
      )
        @factor_hash = factor_hash
        @factor_ids = factor_ids
        @scoring = scoring
        @factors_question_count = factors_question_count
        @norm = norm
        @external_results = external_results
        @factor_norm_hash = factor_norm_hash
        @visited_factor_ids = visited_factor_ids
        @answers = answers
      end
      # rubocop:enable Metrics/ParameterLists

      def call # rubocop:disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
        extended_scoring = factors_sorted_by_formula_factors_at_end.reduce(scoring) do |extending_scoring, factor_data| # rubocop:disable Metrics/BlockLength
          factor = factor_data[:factor]
          factor_scoring = extending_scoring[factor.id.to_s]
          factor_norm = factor_norm_hash[factor.id]
          next extending_scoring if factor_scoring&.key?('score')

          next extending_scoring if factor.custom_formula_strategy? && @visited_factor_ids.include?(factor.id)

          @visited_factor_ids.add(factor.id) if factor.custom_formula_strategy?

          module_name = "::UsersResults::Scoring::AddScoreByStrategy::#{factor.scoring_strategy.camelize}".constantize

          extending_scoring = module_name.call!(
            factor_data,
            extending_scoring,
            factor_hash,
            norm,
            factor_norm_hash,
            external_results,
            factors_question_count,
            visited_factor_ids,
            answers
          )
          next extending_scoring if norm.nil? || factor.external_score_strategy?

          score = extending_scoring.dig(factor.id.to_s, 'score')
          if norm.percentile?
            zscore = UsersResults::Scoring::GetZscoreForFactor.call!(factor, score, factor_norm)
            extending_scoring = extending_scoring.deep_merge(factor.id.to_s => { 'zscore' => zscore })
          end
          norm_score = UsersResults::Scoring::GetNormScoreForFactor.call!(
            factor.id, factor_hash, norm, extending_scoring, factor_norm
          )
          @visited_factor_ids.clear if factor.custom_formula_strategy?
          extending_scoring.deep_merge(factor.id.to_s => { 'norm_score' => norm_score })
        end

        broadcast :ok, extended_scoring
      end

      def factors_sorted_by_formula_factors_at_end
        factor_hash.fetch_values(*factor_ids).sort_by do |factor_data|
          factor_data[:factor].custom_formula_strategy? ? 1 : 0
        end
      end
    end
  end
end
