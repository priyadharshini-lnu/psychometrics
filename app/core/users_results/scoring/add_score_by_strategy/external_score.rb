# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class ExternalScore < BaseStrategy
        private

        def call
          factor = factor_data[:factor]
          return if factor.external_scoring.blank?

          factor_scoring = extended_scoring.fetch(factor.id.to_s, {})
          factor.external_scoring.each do |row|
            value = JsonPath.new(row['jsonpath']).first(external_results)
            factor_scoring[row['type']] = value&.to_f
          end

          broadcast(:ok, extended_scoring.merge(factor.id.to_s => factor_scoring))
        end
      end
    end
  end
end
