# frozen_string_literal: true

module UsersResults
  module Scoring
    class Extend < BaseCommand
      private_attr_reader :scoring, :norm_data, :dimension

      def initialize(scoring, norm_data, dimension)
        @scoring = scoring.deep_stringify_keys
        @norm_data = norm_data
        @dimension = dimension
      end

      def call
        return broadcast :ok, scoring if scoring.blank?

        factor_hash = dimension.all_factors.index_by(&:id)

        sub_factor_hash = FactorsSubFactor.
                          where(factor_id: factor_hash.keys, sub_factor_id: factor_hash.keys).
                          select(:factor_id, :sub_factor_id, :weight).
                          group_by(&:factor_id)

        factor_hash = factor_hash.reduce({}) do |new_factor_hash, (factor_id, factor)|
          new_factor_hash.merge(factor_id => {
            factor: factor,
            sub_factor_hash: sub_factor_hash[factor_id]&.index_by(&:sub_factor_id) || {}
          })
        end

        extended_scoring = ::UsersResults::Scoring::AddScore.call!(factor_hash, factor_hash.keys, scoring)
        extended_scoring = ::UsersResults::Scoring::AddZScore.call!(extended_scoring, norm_data, factor_norm_hash)
        extended_scoring = ::UsersResults::Scoring::AddNormScore.call!(
          extended_scoring, norm_data, factor_hash, factor_norm_hash
        )

        broadcast :ok, extended_scoring
      end

      private

      def factor_norm_hash
        @factor_norm_hash ||=
          if norm_data.present? && norm_data['id']
            FactorsNorm.where(
              factor_id: scoring.keys,
              norm_id: norm_data['id']
            ).index_by(&:factor_id)
          else
            {}
          end
      end
    end
  end
end
