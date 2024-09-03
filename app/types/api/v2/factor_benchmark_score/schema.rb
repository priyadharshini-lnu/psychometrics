# frozen_string_literal: true

module Api
  module V2
    module FactorBenchmarkScore
      class Schema < Api::Base::Schema
        def self.resource
          'factor_benchmark_scores'
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:factor_id].filled(:string)
            attribute[:benchmark_score].filled(:string)
          end
        end

        def self.bulk_create
          json_api_attributes do
            Dry::Schema.define do
              hash do
                optional(:operation).filled(:bool)
                required(:value).filled(:bool)
              end
            end
          end
        end

        def self.meta?
          false
        end

        def self.links?
          false
        end
      end
    end
  end
end
