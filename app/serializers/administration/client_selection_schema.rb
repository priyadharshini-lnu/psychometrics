# frozen_string_literal: true

module Administration
  class ClientSelectionSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:subdomain).filled(:str?)
        required(:highest_role).filled(:str?)
      end
    end
  end
end
