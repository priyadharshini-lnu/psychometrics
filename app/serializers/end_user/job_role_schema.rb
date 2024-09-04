# frozen_string_literal: true

module EndUser
  class JobRoleSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:integer)
        required(:name).filled(:string)
      end
    end
  end
end
