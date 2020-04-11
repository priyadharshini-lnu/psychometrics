# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class BaseStrategy < BaseCommand
        private_attr_reader :factor_data, :extended_scoring, :factor_hash

        def initialize(factor_data, extended_scoring, factor_hash)
          @factor_data = factor_data
          @extended_scoring = extended_scoring
          @factor_hash = factor_hash
        end
      end
    end
  end
end
