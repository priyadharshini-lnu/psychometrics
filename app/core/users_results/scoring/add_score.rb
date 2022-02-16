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

          if factor_scoring&.key?('score')
            extending_scoring
          else
            module_name = "::UsersResults::Scoring::AddScoreByStrategy::#{factor.scoring_strategy.camelize}".constantize
            new_extended_scoring = module_name.call!(
              factor_data, extending_scoring, factor_hash, norm, factor_norm_hash, factors_question_count
            )
            if norm
              score = new_extended_scoring.dig(factor.id.to_s, 'score')
              zscore = UsersResults::Scoring::GetZscoreForFactor.call!(
                factor_data[:factor], score, norm, factor_norm_hash
              )
              new_extended_scoring.deep_merge(factor.id.to_s => { 'zscore' => zscore })
              norm_score = UsersResults::Scoring::GetNormScoreForFactor.call!(
                factor_data, norm, new_extended_scoring, factor_norm_hash
              )
              new_extended_scoring = new_extended_scoring.deep_merge(factor.id.to_s => { 'norm_score' => norm_score })
            end
            new_extended_scoring
          end
        end

        broadcast :ok, extended_scoring
      end
    end
  end
end
