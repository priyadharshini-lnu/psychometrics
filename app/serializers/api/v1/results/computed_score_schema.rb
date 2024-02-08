# frozen_string_literal: true

module Api
  module V1
    module Results
      class ComputedScoreSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:str?)
            required(:name).filled(:str?)
            required(:value) { int? | float? }
          end
        end
      end
    end
  end
end
