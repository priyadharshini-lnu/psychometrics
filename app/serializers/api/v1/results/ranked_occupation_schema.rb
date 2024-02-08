# frozen_string_literal: true

module Api
  module V1
    module Results
      class RankedOccupationSchema < BaseSchema
        def self.schema(_, _)
          Dry::Schema.JSON do
            config.validate_keys = true

            required(:id).filled(:int?)
            required(:rank).filled(:int?)
            required(:name).filled(:str?)
            required(:value) { int? | float? }
            required(:stars).filled(:int?)
          end
        end
      end
    end
  end
end
