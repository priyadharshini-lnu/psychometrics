# frozen_string_literal: true

module Administration
  class IndividualDashboardSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:user).filled(:int)
      end
    end
  end
end
