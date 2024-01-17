# frozen_string_literal: true

module Administration
  class DetailsDatasheetRowSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:record).maybe(:hash?)
        required(:columns).array do
          schema do
            required(:name).filled(:str?)
            required(:type).filled(:str?)
            required(:dashboard_use).filled(:bool?)
            required(:accessor_access).filled(:bool?)
            required(:visible_in_list).filled(:bool?)
          end
        end
        required(:type).filled(:str?)
      end
    end
  end
end
