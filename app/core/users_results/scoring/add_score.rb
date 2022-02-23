# frozen_string_literal: true

module UsersResults
  module Scoring
    class AddScore < BaseCommand
      attr_reader :factor_hash, :factor_ids, :scoring, :norm, :factor_norm_hash, :factors_question_count

      # rubocop:disable Metrics/ParameterLists
      def initialize(factor_hash, factor_ids, scoring, norm, factor_norm_hash, factors_question_count = {})
        @factor_hash = factor_hash
        @factor_ids = factor_ids
        @scoring = scoring
        @factors_question_count = factors_question_count
        @norm = norm
        @factor_norm_hash = factor_norm_hash
      end
      # rubocop:enable Metrics/ParameterLists

      def call
        extended_scoring = factor_hash.fetch_values(*factor_ids).reduce(scoring) do |extending_scoring, factor_data|
          factor = factor_data[:factor]
          factor_scoring = extending_scoring[factor.id.to_s]
          factor_norm = factor_norm_hash[factor.id]

          next extending_scoring if factor_scoring&.key?('score')

          module_name = "::UsersResults::Scoring::AddScoreByStrategy::#{factor.scoring_strategy.camelize}".constantize
          extending_scoring = module_name.call!(
            factor_data, extending_scoring, factor_hash, norm, factor_norm_hash, factors_question_count
          )
          next extending_scoring if norm.nil?

          score = extending_scoring.dig(factor.id.to_s, 'score')
          if norm.percentile?
            zscore = UsersResults::Scoring::GetZscoreForFactor.call!(factor, score, factor_norm)
            extending_scoring = extending_scoring.deep_merge(factor.id.to_s => { 'zscore' => zscore })
          end
          norm_score = UsersResults::Scoring::GetNormScoreForFactor.call!(
            factor.id, factor_hash, norm, extending_scoring, factor_norm
          )
          extending_scoring.deep_merge(factor.id.to_s => { 'norm_score' => norm_score })
        end

        broadcast :ok, extended_scoring
      end
    end
  end
end
