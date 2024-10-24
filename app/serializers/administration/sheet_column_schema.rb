# frozen_string_literal: true

module Administration
  class SheetColumnSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:column_type).filled(:str?)
        required(:position).filled(:int?)
        required(:dashboard_use).filled(:bool?)
        required(:accessor_access).filled(:bool?)
        required(:visible_in_list).filled(:bool?)
      end
    end
  end
end
