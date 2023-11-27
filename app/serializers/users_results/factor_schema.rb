# frozen_string_literal: true

module UsersResults
  class FactorSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:str?)
        required(:name).filled(:str?)
      end
    end
  end
end
