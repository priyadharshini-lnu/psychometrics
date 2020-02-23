# frozen_string_literal: true

module UsersResults
  module Scoring
    class Extend < BaseCommand
      private_attr_reader :scoring, :norm_data

      def initialize(scoring, norm_data)
        @scoring = scoring
        @norm_data = norm_data
      end

      def call
        return broadcast :ok, scoring if scoring.blank?

        factor_hash = Factor.where(id: scoring.keys).index_by(&:id)

        sub_factor_hash = FactorsSubFactor.
                          where(factor_id: scoring.keys, sub_factor_id: scoring.keys).
                          select(:factor_id, :sub_factor_id, :weight).
                          group_by(&:factor_id)

        factor_hash = factor_hash.reduce({}) do |new_factor_hash, (factor_id, factor)|
          new_factor_hash.merge(factor_id => {
            factor: factor,
            sub_factor_hash: sub_factor_hash[factor_id]&.index_by(&:sub_factor_id) || {}
          })
        end

        extended_scoring = ::UsersResults::Scoring::AddScore.call!(factor_hash, factor_hash.keys, scoring)
        extended_scoring = ::UsersResults::Scoring::AddNormScore.call!(extended_scoring, norm_data)

        broadcast :ok, extended_scoring
      end
    end
  end
end
