# frozen_string_literal: true

module UsersResults
  module Scoring
    class AddNormScore < BaseCommand
      attr_reader :scoring, :norm_data

      def initialize(scoring, norm_data)
        @scoring = scoring
        @norm_data = norm_data
      end

      def call
        factor_norm_hash =
          if norm_data.present? && norm_data['id'] && norm_data['type']
            FactorsNorm.where(
              factor_id: scoring.keys,
              norm_id: norm_data['id'],
              type: norm_data['type'].downcase
            ).index_by(&:factor_id)
          else
            {}
          end

        extended_scoring = scoring.reduce({}) do |extending_scoring, (factor_id, value)|
          factor_norm = factor_norm_hash[factor_id.to_i]

          norm_score = factor_norm&.calc_norm_level(value['score'])
          extending_scoring.merge(factor_id => value.merge('norm_score' => norm_score))
        end

        broadcast :ok, extended_scoring
      end
    end
  end
end
