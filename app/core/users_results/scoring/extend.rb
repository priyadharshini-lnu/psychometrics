# frozen_string_literal: true

module UsersResults
  module Scoring
    class Extend < BaseCommand
      private_attr_reader :scoring, :norm_data, :dimension, :external_results, :factors_question_count

      def initialize(scoring, norm_data, dimension, external_results, factors_question_count = {})
        @external_results = external_results
        @scoring = scoring.deep_stringify_keys
        @norm_data = norm_data
        @dimension = dimension
        @factors_question_count = factors_question_count
      end

      def call
        factor_hash = dimension.all_factors.index_by(&:id)

        sub_factor_hash = FactorsSubFactor.
                          where(factor_id: factor_hash.keys, sub_factor_id: factor_hash.keys).
                          select(:factor_id, :sub_factor_id, :weight, :predicate, :value).
                          group_by(&:factor_id)

        factor_hash = factor_hash.reduce({}) do |new_factor_hash, (factor_id, factor)|
          new_factor_hash.merge(factor_id => {
            factor: factor,
            sub_factor_hash: sub_factor_hash[factor_id]&.index_by(&:sub_factor_id) || {}
          })
        end

        norm = Norm.find_by(id: norm_data['id']) if norm_data.present? && norm_data['id']
        extended_scoring = ::UsersResults::Scoring::AddScore.call!(
          factor_hash, factor_hash.keys, scoring, norm, factor_norm_hash, external_results, factors_question_count
        )

        broadcast :ok, extended_scoring
      end

      private

      def factor_norm_hash
        @factor_norm_hash ||=
          if norm_data.present? && norm_data['id']
            FactorsNorm.where(
              norm_id: norm_data['id']
            ).index_by(&:factor_id)
          else
            {}
          end
      end
    end
  end
end
